"use strict";

const deepAssign = require("deep-assign");
const deepDiff = require("deep-diff");
const clone = require("clone");
const log = require("log");
const MsgBus = require("msgbus");
const { Deferred, assertType, asyncWithTmo, delay } = require("misc");
const RestClient = require("restclient");
const ProviderClient = require("providerclient");
const STATE = require("./states");
const { DEFAULT_HEARTBEAT_INTERVAL, DEFAULT_HEARTBEAT_TIMEOUT, DEFAULT_DISPOSE_RUN_WAIT_TIMEOUT, DEFAULT_MIN_RUN_TIME } = require("./constants");
const { ServiceError } = require("./errors");
const State = require("./types/state");

const ACTIVE_CONFIG_TAG = "active";

const DEPENDENCY_TYPE = {
    "NEED": "need",
    "WANT": "want"
};

let instance;

class Manager {
    constructor() {
    }

    static get instance() {
        if (!instance) {
            instance = new this();
        }

        return instance;
    }

    /** Initialize service
     * @param {Object} appService Application service instance
     * @param {Object} [opts] Options
     * @param {Integer|Boolean} [opts.heartbeatInterval] - Time in ms between heartbeats.
     *     Set to false to disable heartbeat
     * @returns {Promise} Promise
     */
    async create(appService, opts) {
        if (!opts.hasOwnProperty("heartbeatInterval")) {
            opts.heartbeatInterval = DEFAULT_HEARTBEAT_INTERVAL;
        }

        if (!opts.hasOwnProperty("autoUseMgmt")) {
            opts.autoUseMgmt = true;
        }

        if (!opts.hasOwnProperty("minRunTime")) {
            opts.minRunTime = DEFAULT_MIN_RUN_TIME;
        }

        // First, make sure that the application knows it's manager
        appService._setServiceMgr(this);
        // State cannot have require-dependency to manager, need to push
        // a run-time reference instead.
        State.setManager(this);

        this.opts = opts;

        // Configure log level, may be overriden by config later
        await log.configure(this.opts.level);

        this.app = appService;
        this._msgBus = new MsgBus(this.opts.bus);
        this.state = STATE.NOT_CREATED;
        this.stateType = State.instance;
        this.disableRestart = false;

        this.log("info", "Created");

        // Do not wait for start, it will run and run and run...
        this.finished = this._run();

        return this.finished;
    }

    restart(cause = "restart") {
        this.log("info", `Restart request, cause=${cause}`);
        if (this.abortCurrentAwaitDeferred) {
            this.abortCurrentAwaitDeferred.reject(new ServiceError(cause, true));
        }

        if (this.endRunDeferred) {
            this.endRunDeferred.resolve(false);
        }
    }

    /**
     * Dispose ServiceMgr
     * @public
     * @return {undefined}
     */
    async dispose() {
        if (this.abortCurrentAwaitDeferred) {
            this.abortCurrentAwaitDeferred.reject(new ServiceError("Dispose"));
        }

        if (this.endRunDeferred) {
            this.endRunDeferred.resolve(true);
        }

        if (this.finished) {
            // Disable restarts in _run
            this.disableRestart = true;

            // Wait for _run
            await asyncWithTmo(
                this.finished,
                DEFAULT_DISPOSE_RUN_WAIT_TIMEOUT,
                new ServiceError("Timeout at dispose while waiting for _run")
            );
        }
    }

    async _run() {
        let isRunning = true;
        let loopBeginTs;

        while (isRunning && !this.disableRestart) {
            // Limit restart frequency
            if (loopBeginTs) {
                const lastLoopDuration = Date.now() - loopBeginTs;
                if (lastLoopDuration <= this.config.minRunTime) {
                    const delayMs = this.config.minRunTime - lastLoopDuration;
                    this.log("info", `Delaying restart ${delayMs} ms...`);
                    await delay(delayMs);
                }
            }
            loopBeginTs = Date.now();

            try {
                this.endRunDeferred = new Deferred();

                // State created
                this._stateTransition(STATE.CREATED);
                await this._onCreated();

                // State connected
                await this.app._onConnect();
                this._stateTransition(STATE.CONNECTED);
                await this._onConnected();

                // State setup
                await this.app._onSetup();
                this._stateTransition(STATE.SETUP);
                await this._onSetup();

                // State online
                await this.app._onOnline();
                this._stateTransition(STATE.ONLINE);
                await this._onOnline();
                if (await this.endRunDeferred.promise) {
                    isRunning = false;
                }
            } catch (error) {
                if (error instanceof ServiceError) {
                    this.log("error", `Service runner exception, restart=${error.restart}`, error);
                    isRunning = error.restart;
                } else {
                    this.log("error", "Service runner exit, uncaught exception", error);
                    // Exit on all other errors...
                    isRunning = false;
                }
            }
            try {
                // State offline
                this._stateTransition(STATE.OFFLINE);
                await this._prepareOffline();
                await this.app._onOffline();
                await this._onOffline();
            } catch (error) {
                if (error instanceof ServiceError) {
                    this.log("error", "Service runner exception when " +
                        `going offline, restart=${error.restart}`, error);
                    isRunning = error.restart;
                } else {
                    this.log("error", "Service runner exit when going offline, " +
                        "uncaught exception", error);
                    // Exit on all other errors...
                    isRunning = false;
                }
            }
        }
        this.log("info", "Now exit");
        this._stateTransition(STATE.EXIT);
    }

    async _stateTransition(newState) {
        const oldState = this.state;
        this.state = newState;
        this.log("info", `State transition ${oldState} -> ${newState}`);
    }

    async _onCreated() {
        this.usedServices = {};
        this.providedServices = {};

        if (this.opts.autoUseMgmt) {
            await this.need("mgmtCfg", "mgmt", RestClient, this.opts.mgmtCfg);
        }

        this.msgBus.on("data", this._consumeMgmtEvent.bind(this));
        try {
            await this.msgBus.start();
        } catch (error) {
            if (error.code && error.code === "ECONNREFUSED") {
                const msg = `Mgmt bus connection failed: ${error.message}`;
                throw new ServiceError(msg, true);
            } else {
                // Unknown error, do not restart
                throw error;
            }
        }
    }

    async _onConnected() {
        await this._broadcastStateEvent();
        this._tryStartPeriodicHeartbeat();
        if (this.opts.autoUseMgmt) {
            await this._getInitialConfig();
            await log.configure(this.opts.level);
        }
    }

    async _onSetup() {
        await this._broadcastStateEvent();
        const allOk = await this._allUsedServicesOnline();
        if (!allOk) {
            throw new ServiceError("Setup aborted, depending service rejected", true);
        }
    }

    async _onOnline() {
        await this._broadcastStateEvent();
    }

    async _prepareOffline() {
        this._tryStopPeriodicHeartbeat();

        try {
            await this._broadcastStateEvent();
        } catch (error) {
            this.log("warn", "Broadcast offline failed", error);
        }

        // Close all open used services
        for (const serviceId of Object.keys(this.usedServices)) {
            const service = this.usedServices[serviceId];
            service.setOffline(this, serviceId, "going offline");
        }
    }

    async _onOffline() {
        await this.msgBus.dispose();
    }

    async _addDependency(dependencyType, id, providerName, Client, config) {
        if (id in this.usedServices) {
            throw new ServiceError(`Application ${this.app.name} ` +
                `has already registered service ${id} for usage!`);
        }
        assertType(providerName, "providerName", "string");

        if (!Client.me || Client.me() !== ProviderClient) {
            throw new Error("Client must extend ProviderClient");
        }

        this.usedServices[id] = {
            id: id,
            name: providerName,
            type: Client.typeName,
            dependencyType: dependencyType,
            Client: Client,
            config: config,
            state: STATE.NOT_CREATED,
            serviceDeferred: new Deferred()
        };

        this.usedServices[id].cancelHeartbeatTimeout = function() {
            if (this.heartbeatTimeout) {
                clearInterval(this.heartbeatTimeout);
            }
        }.bind(this.usedServices[id]);

        this.usedServices[id].renewHeartbeat = function(mgr) {
            if (this.config && this.config.testMode) {
                return;
            }

            this.cancelHeartbeatTimeout();
            this.heartbeatTimeout = setInterval(
                this.setOffline.bind(this, mgr, this.id, "heartbeat timeout"),
                DEFAULT_HEARTBEAT_TIMEOUT);
            this.numHeatbeats = (this.numHeatbeats || 0) + 1;
            this.lastHeartbeatTs = Date.now();
        }.bind(this.usedServices[id]);

        this.usedServices[id].setOnline = async function(mgr, serviceId, provideParams) {
            mgr.log("verbose", `Service ${serviceId}:${this.type} from ${this.name} set online`);
            this.instance = new this.Client(Object.assign({}, this.config, provideParams), mgr);
            await this.instance.startBase();
            this.renewHeartbeat(mgr);
            this.state = STATE.ONLINE;
            mgr._checkAllUsedServicesOnline(serviceId);
            this.serviceDeferred.resolve(this.instance);
        }.bind(this.usedServices[id]);

        this.usedServices[id].setOffline = function(mgr, serviceId, cause) {
            if (this.state === STATE.ONLINE) {
                const msgPart1 = `Service ${serviceId}:${this.type} from ` +
                    `${this.name} set offline due to ${cause}`;
                mgr.log("info", `${msgPart1}`);
                this.cancelHeartbeatTimeout();
                if (this.instance) {
                    this.instance.dispose();
                }
                this.state = STATE.OFFLINE;
                const restartOnOffline = this.dependencyType === DEPENDENCY_TYPE.NEED;
                if (restartOnOffline) {
                    this.serviceDeferred.reject(new ServiceError(
                        `${msgPart1}, was in state state ${this.state}`, true));
                }
                this.serviceDeferred = new Deferred();
                this.instance = null;
                if (restartOnOffline && mgr.endRunDeferred) {
                    mgr.endRunDeferred.resolve(false);
                }

                return restartOnOffline;
            }
        }.bind(this.usedServices[id]);

        if (this.usedServices[id].config && this.usedServices[id].config.testMode) {
            await this.usedServices[id].setOnline(this, id, this.usedServices[id].config);
        }
    }

    async need(id, providerName, Client, config) {
        this._addDependency(DEPENDENCY_TYPE.NEED, id, providerName, Client, config);
    }

    async want(id, providerName, Client, config) {
        this._addDependency(DEPENDENCY_TYPE.WANT, id, providerName, Client, config);
    }

    has(serviceId) {
        return serviceId in this.usedServices;
    }

    async use(serviceId) {
        if (!(serviceId in this.usedServices)) {
            throw new ServiceError(`Application ${this.app.name} ` +
                `has not registered service ${serviceId} for usage`);
        }

        return this._awaitWithAbort(
            this.usedServices[serviceId].serviceDeferred.promise
        );
    }

    async provide(serviceType, params) {
        if (serviceType in this.providedServices) {
            throw new ServiceError(`Application ${this.app.name} already ` +
                `provides service of type ${serviceType}`);
        }
        this.providedServices[serviceType] = params;
    }

    _checkAllUsedServicesOnline(serviceIdNowOnline = false) {
        let allOnline = true;
        for (const serviceId of Object.keys(this.usedServices)) {
            const service = this.usedServices[serviceId];
            const serviceIdStr = `${service.id}:${service.type} from ${service.name}`;
            if (service.state === STATE.ONLINE) {
                if (!serviceIdNowOnline) {
                    this.log("info", `Service ${serviceIdStr} is online`);
                } else if (serviceIdNowOnline === serviceId) {
                    this.log("info", `Service ${serviceIdStr} is now online`);
                }
            } else {
                if (!serviceIdNowOnline) {
                    this.log("info", `Waiting for service ${serviceIdStr}`);
                }
                allOnline = false;
            }
        }

        if (allOnline && this.allDepsOnlineDeferred) {
            this.allDepsOnlineDeferred.resolve(true);
        }

        return allOnline;
    }

    async _allUsedServicesOnline() {
        this.log("info", "Waiting for all used services to go online...");
        this.allDepsOnlineDeferred = new Deferred();
        this._checkAllUsedServicesOnline();
        try {
            await this.allDepsOnlineDeferred.promise;

            return true;
        } catch (error) {
            this.log("warn", "Used service rejected when waiting for " +
                "it to go online", error);

            return false;
        }
    }

    get currentState() {
        return this.state;
    }

    addMgmtBusListener(listener) {
        this.msgBus.on("data", listener);
    }

    get msgBus() {
        return this._msgBus;
    }

    async _consumeStateSnapshotEvent(providerName, eventData) {
        let anyOfMyDepsNowOffline = false;
        for (const serviceId of Object.keys(this.usedServices)) {
            const service = this.usedServices[serviceId];
            if (service.name === providerName) {
                const prevServiceState = service.state;
                service.state = eventData.state;
                const serviceIdStr = `${service.id}:${service.type} from ${service.name}`;

                this.log("debug", `Used service ${serviceIdStr} state transition ${prevServiceState} -> ${service.state}`);

                const provides = eventData.provides;
                if (service.type in provides) {
                    // Now ONLINE, resolve service dependency
                    if (service.state === STATE.ONLINE &&
                        service.state !== prevServiceState) {
                        this.log("verbose", `Used service ${serviceIdStr} now online providing ${JSON.stringify(provides)}`);

                        await service.setOnline(this, serviceId, provides[service.type]);
                    } else if (service.state === STATE.ONLINE &&
                        prevServiceState === STATE.ONLINE) {
                        // Still ONLINE, heartbeat
                        this.log("debug", `Used service ${serviceIdStr} online heartbeat`);

                        service.renewHeartbeat(this);
                    } else if (service.state === STATE.OFFLINE &&
                        prevServiceState === STATE.ONLINE) {
                        // Now OFFLINE, reject service dependency
                        this.log("info", `Used service ${serviceIdStr} now offline`);

                        const restartRequired = service.setOffline(this, serviceId, "remote offline");
                        if (restartRequired) {
                            anyOfMyDepsNowOffline = true;
                        }
                    }
                }
            }
        }

        if (anyOfMyDepsNowOffline) {
            // Do currentState -> OFFLINE -> CREATED
            this.log("warn", "Restarting, detected offline dependencies!");

            // First reject all not already rejected dependencies
            for (const serviceId of Object.keys(this.usedServices)) {
                const service = this.usedServices[serviceId];
                service.setOffline(this, serviceId, "restart");
            }
        } else if (this.app.name !== providerName &&
            this.currentState === STATE.ONLINE) {
            // If any other service in it's SETUP state wants to use any service
            // that I provide, issue a heartbeat without waiting for the peridoc ones
            // (if I'm online that is...)
            this.log("debug", `Other service ${providerName} discovered in state ${eventData.state}`);
            const listenToStates = [ STATE.SETUP, STATE.CONNECTED ];
            if (listenToStates.indexOf(eventData.state) !== -1) {
                let issueHeartBeat = false;
                const needs = eventData.uses;
                for (const id of Object.keys(needs)) {
                    const need = needs[id];
                    if (need.name === this.app.name) {
                        this.log("verbose", `Other service ${providerName} ` +
                            `needs ${need.type} which I may provide. Heartbeat...`);
                        issueHeartBeat = true;
                    }
                }

                if (issueHeartBeat) {
                    await this._broadcastStateEvent(false);
                }
            }
        }
    }

    async _consumeConfigUpdateEvent(event) {
        // Is event for me?
        if (this.config._id && (event.newdata._id === this.config._id)) {
            this.log("verbose", "Config update event", event);

            /* Check if current config is set inactive
             * (active tag exists in old but not in new) */
            if (event.olddata.tags.indexOf(ACTIVE_CONFIG_TAG) !== -1 &&
                event.newdata.tags.indexOf(ACTIVE_CONFIG_TAG) === -1) {
                this.log("info", `Config ${this.config._id} is not active anymore...`);
                await this._updateConfig();
            }
        }
    }

    async _consumeMgmtEvent(event) {
        switch (event.event) {
        case "snapshot":
            const [ providerName, type ] = event.type.split(".");
            if (type === "state") {
                await this._consumeStateSnapshotEvent(providerName, event.newdata);
            }
            break;
        case "updated":
            if (event.type === "mgmt.config") {
                await this._consumeConfigUpdateEvent(event);
            }
            break;
        }
    }

    _getUsedServices() {
        const uses = {};
        for (const serviceId of Object.keys(this.usedServices)) {
            const service = this.usedServices[serviceId];
            uses[serviceId] = {
                name: service.name,
                type: service.type,
                state: service.state,
                dependencyType: service.dependencyType
            };
        }

        return uses;
    }

    async _getInitialConfig() {
        this.log("info", "Waiting for initial config...");

        const config = await this._getActiveConfig();
        this.log("verbose", "Got initial config", config);

        if (config) {
            deepAssign(this.opts, config);
            this.log("info", `Using config ${this.opts._id}`);
        } else {
            this.log("error", "Got config", config);
            throw new ServiceError("Got invalid config", true);
        }
    }

    async _getActiveConfig() {
        let config = false;
        try {
            const cfgRestClient = await this.use("mgmtCfg");
            /* tags=active matches all configs whose tags array contains
             * at least one occurence of the string "active".
             * Mongo documentation: https://docs.mongodb.com/manual/tutorial/query-documents/#match-an-array-element
             */
            const activeConfigs = await this._awaitWithAbort(
                cfgRestClient.get("/config", {
                    name: this.app.name,
                    tags: "active"
                })
            );
            if (activeConfigs.length === 1) {
                config = activeConfigs[0];
            } else {
                this.log("error", `Expected one active config, got ${activeConfigs.length}`);
            }
        } catch (err) {
            if (err instanceof ServiceError) {
                throw err;
            }
            this.log("error", `Failed to get config, error=${err}`);
        }

        return config;
    }

    /**
     * Process config diffs and annotates config diffs by adding properties:
     * The diff is annotated by adding properties:
     * ignored - Diff can safely be ignored.
     * accepted - Diff handled by ServiceManager, set to true if accepted by
     *   ServiceManager and no further processing is needed by Service.
     * @param {Object} diffs Diffs to annotate
     * @return {Object} Annotated diff
     */
    async _processConfigDiffs(diffs) {
        // Annotate diff as ignored
        const setIgnoreProp = async (diff) => diff.ignored = true;

        /* List with path, handlerFn pairs. If path matches diff.path handlerFn
         * is called with diff as argument. */
        const configDiffHandlers = [ {
            pathBeginsWith: [ "_id" ],
            handlerFn: setIgnoreProp
        }, {
            pathBeginsWith: [ "created" ],
            handlerFn: setIgnoreProp
        }, {
            pathBeginsWith: [ "saved" ],
            handlerFn: setIgnoreProp
        }, {
            pathBeginsWith: [ "tags" ],
            handlerFn: setIgnoreProp
        }, {
            pathBeginsWith: [ "level" ],
            handlerFn: async (diff) => {
                await log.configure(diff.rhs);
                this.log("info", `Config log level reconfigured to ${diff.rhs}`);
                diff.accepted = true;
            }
        } ];

        for (const diff of diffs) {
            for (const { pathBeginsWith, handlerFn } of configDiffHandlers) {
                /* Path in configDiffHandlers is not required to match the
                 * full path of diff. It is enough that the diff path begins
                 * with the given path. */
                if (pathBeginsWith.length <= diff.path.length) {
                    let pathMatches = true;
                    for (let i = 0; i < pathBeginsWith.length; i++) {
                        if (pathBeginsWith[i] !== diff.path[i]) {
                            pathMatches = false;
                            break;
                        }
                    }
                    if (pathMatches) {
                        await handlerFn(diff);
                    }
                }
            }
        }
    }

    async _updateConfig() {
        this.log("info", "Waiting for new config...");
        const newConfig = await this._getActiveConfig();

        // TODO: Support reconfiguration when config options is removed

        // Combine received config with current config to get full config
        const fullNewConfig = deepAssign(clone(this.config), newConfig);
        const diffs = deepDiff(this.config, fullNewConfig);

        // Annotate config
        await this._processConfigDiffs(diffs);

        this.log("verbose", "Got new config, annotated diff=", diffs);

        const accepted = await this.app._onConfigUpdate(diffs, fullNewConfig);
        if (accepted) {
            this.opts = fullNewConfig;
            this.log("info", `New config ${this.opts._id} accepted`);
        } else {
            this.restart("config update");
        }
    }

    /**
     * Race promise given as argument against a deferred exposed
     * as this.abortCurrentAwaitDeferred.
     * This function is used when the await shall be possible to abort due
     * to for example dispose().
     * @param {Promise} promise Promise to wait for
     * @return {Promise} New aggregated promise
     * @private
     */
    async _awaitWithAbort(promise) {
        this.abortCurrentAwaitDeferred = new Deferred();
        const res = await Promise.race([
            promise,
            this.abortCurrentAwaitDeferred.promise
        ]);
        this.abortCurrentAwaitDeferred = null;

        return res;
    }

    _tryStartPeriodicHeartbeat() {
        if (this.opts.heartbeatInterval) {
            this.heartbeatHandle = setInterval(
                this._broadcastStateEvent.bind(this, false),
                this.opts.heartbeatInterval
            );
        }
    }

    _tryStopPeriodicHeartbeat() {
        if (this.heartbeatHandle) {
            clearInterval(this.heartbeatHandle);
        }
    }

    async _broadcastStateEvent(useParentId = true) {
        const parentIds = [];
        if (useParentId && this.prevMsgId) {
            parentIds.push(this.prevMsgId);
        }

        const data = {
            name: this.app.name,
            state: this.currentState,
            uses: this._getUsedServices(),
            provides: this.providedServices
        };

        this.stateType.set(data);
        const msg = await this.stateType.notifyUpdate(parentIds);

        if (useParentId) {
            this.prevMsgId = msg._id;
        }
    }

    /**
     * Return the configuration
     * @public
     * @return {Object} the configuration
     */
    get config() {
        return this.opts;
    }

    /**
     * Return the name of the service
     * @public
     * @return {string} the name of the service
     */
    get serviceName() {
        return this.app.name;
    }

    log(level, msg, ...args) {
        const logArgs = [
            level,
            `Service[${this.serviceName}] ${msg}`,
            ...args
        ];
        log.log.bind(log)(...logArgs);
    }
}

module.exports = Manager;
