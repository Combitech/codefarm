"use strict";

const { Deferred, Disposable } = require("misc");
const States = require("./controllers/states");

/**
 * Class representing an application service
 */
class Service {
    /**
     * Create Service
     * @param {String} name Application service name
     * @param {String} version Application service version
     */
    constructor(name, version) {
        this.name = name;
        this.version = version;
        this.disposables = [];
        this.connectDeferred = new Deferred();
        this.setupDeferred = new Deferred();
        this.onlineDeferred = new Deferred();
        this.offlineDeferred = new Deferred();
        this.configUpdatedDeferred = new Deferred();
    }

    /**
     * Called when service has connected to the management message bus.
     * There is usually no reason for a service to implement this state.
     * @public
     * @return {undefined}
     */
    async onConnect() {
        this.log("debug", "onConnect");
    }

    /**
     * Called when service has connected to the management message bus.
     * Code can be inserted here to do things before or after
     * the service implementation executes its code
     * @return {undefined}
     * @private
     */
    async _onConnect(...args) {
        await this.onConnect(...args);
        this.connectDeferred.resolve();
        this.offlineDeferred = new Deferred();
    }

    /**
     * Called when service config has been received
     * on the management message bus.
     * This is where the service defines:
     * - The services that it provides on using provide()
     * - The services that it depends on using addDependency()
     * @public
     * @return {undefined}
     */
    async onSetup() {
        this.log("debug", "onSetup");
    }

    /**
     * Called when service config has been received
     * on the management message bus.
     * Code can be inserted here to do things before or after
     * the service implementation executes its code
     * @return {undefined}
     * @private
     */
    async _onSetup(...args) {
        await this.onSetup(...args);
        this.setupDeferred.resolve();
    }

    /**
     * Called when all registered dependencies is online.
     * This is where the service starts the provided services.
     * It is now safe to use any of the resolved dependencies with use().
     * The ServiceMgr will broadcast any provided services ONLINE after
     * this method has returned.
     * @public
     * @return {undefined}
     */
    async onOnline() {
        this.log("debug", "onOnline");
    }

    /**
     * Called when service shall go online.
     * Code can be inserted here to do things before or after
     * the service implementation executes its code
     * @return {undefined}
     * @private
     */
    async _onOnline(...args) {
        await this.onOnline(...args);
        this.onlineDeferred.resolve();
    }

    /**
     * Called when service has detected a new config.
     * By default a restart is requested if any diffs is not ignored and
     * not accepted.
     * @param {Object} diffs Diff of old config (lhs) and new config (rhs) in
     *   annotated deep-diff format @see https://www.npmjs.com/package/deep-diff
     *   and ServiceMgr#_processConfigDiffs for info about annotations.
     * @param {Object} newConfig New configuration
     * @return {boolean} true if new new config is accepted without need to restart
     * @public
     */
    async onConfigUpdate(diffs, newConfig) { // eslint-disable-line no-unused-vars
        this.log("debug", "onConfigUpdate config diff=", diffs);

        // Default behaviour is to restart if any important config diffs
        return diffs.filter(this.isConfigDiffImportant.bind(this)).length === 0;
    }

    /**
     * Called when service has detected a new config.
     * @param {Array} args Arguments passed to onConfigUpdate()
     * @return {boolean} true if new new config is accepted without need to restart
     * @private
     */
    async _onConfigUpdate(...args) {
        const accepted = this.onConfigUpdate(...args);
        this.configUpdatedDeferred.resolve();

        return accepted;
    }

    /**
     * Called when service shall go offline.
     * This is where the service stops to provide it's services.
     * @return {undefined}
     * @public
     */
    async onOffline() {
        this.log("debug", "onOffline");
    }

    /**
     * Called when service shall go offline.
     * Code can be inserted here to do things before or after
     * the service implementation executes its code
     * @return {undefined}
     * @private
     */
    async _onOffline(...args) {
        await this.onOffline(...args);

        this.disposables.reverse();
        await Disposable.disposeAll(this.disposables);
        this.disposables.length = 0;
        this.connectDeferred = new Deferred();
        this.setupDeferred = new Deferred();
        this.onlineDeferred = new Deferred();
        this.configUpdatedDeferred = new Deferred();
        this.offlineDeferred.resolve();
    }
    /**
     * Provide service
     * @param {String} serviceType Type of service
     * @param {Object} params Service parameters to include in broadcast
     * @return {undefined}
     * @public
     */
    async provide(serviceType, params) {
        await this.mgr.provide(serviceType, params);
    }

    /**
     * Add a strong dependency to remote service
     * If the remote service goes offline, this service will go offline as well.
     * @param {String} serviceId Local ID used within application service
     * @param {String} providerName Name of provider
     * @param {ProviderClient} Client Class service provided by service
     *   when dependency is resolved using the provided config as well as
     *   the received parameters from the provider.
     * @param {Object} config Any additional configuration required for this
     *   specific type
     * @return {undefined}
     * @public
     */
    async need(serviceId, providerName, Client, config) {
        await this.mgr.need(serviceId, providerName, Client, config);
    }

    /**
     * Add a weak dependency to a remote service
     * If the remote service goes offline, this service will not.
     * @param {String} serviceId Local ID used within application service
     * @param {String} providerName Name of provider
     * @param {ProviderClient} Client Class service provided by service
     *   when dependency is resolved using the provided config as well as
     *   the received parameters from the provider.
     * @param {Object} config Any additional configuration required for this
     *   specific type
     * @return {undefined}
     * @public
     */
    async want(serviceId, providerName, Client, config) {
        await this.mgr.want(serviceId, providerName, Client, config);
    }

    /**
     * Add desposable object
     * @param {Object} disposable Object implementing the disposable interface has a stop method
     * @return {undefined}
     * @public
     */
    addDisposable(disposable) {
        if (typeof disposable.dispose !== "function") {
            throw new Error("Disposable object must implement dispose");
        }

        this.disposables.push(disposable);
    }

    /**
     * Use service previously registered with addDependency
     * @note Only applicable in onOnline()
     * @param {String} serviceId Local ID used within application service
     * @return {undefined}
     * @public
     */
    async use(serviceId) {
        return this.mgr.use(serviceId);
    }

    /**
     * Get the service manager
     * @return {ServiceMgr} The service manager of the application service
     * @public
     */
    get mgr() {
        return this.serviceMgr;
    }

    /**
     * Get the config
     * @return {Object} The config
     * @public
     */
    get config() {
        return this.serviceMgr.config;
    }

    /**
     * Get the service routes
     * @return {Array} Routes provided by service
     * @public
     */
    get routes() {
        return States.instance.routes;
    }

    /**
     * Get the message bus
     * @return {MsgBus} The message bus
     * @public
     */
    get msgBus() {
        return this.serviceMgr.msgBus;
    }

    /**
     * Log something prefixed with service name and such
     * @param {String} level Log level
     * @param {String} msg Message
     * @param {Object} [args] Additional arguments
     * @return {undefined}
     * @public
     */
    log(level, msg, ...args) {
        this.mgr.log.bind(this.mgr)(level, msg, ...args);
    }

    /**
     * Sets the manager managing this service.
     * @note Do not call this directly, called from
     *   ServiceMgr::create()
     * @param {Object} serviceMgr Service manager
     * @return {undefined}
     * @protected
     */
    _setServiceMgr(serviceMgr) {
        this.serviceMgr = serviceMgr;
    }

    /**
     * Check if a config diff is important, that is not already handled
     * or marked as ignored.
     * @param {Object} diff Config diff in annotated deep-diff format.
     *   @see https://www.npmjs.com/package/deep-diff and ServiceMgr#_processConfigDiffs
     * @return {boolean} true if diff is important, false if it can be ignored
     */
    isConfigDiffImportant(diff) {
        return !(diff.ignored || diff.accepted);
    }

    /**
     * Wait for service to go connected, mainly used
     * for tests which might want to await this
     * before starting running tests.
     * @return {undefined}
     * @public
     */
    async awaitConnect() {
        await this.connectDeferred.promise;
    }

    /**
     * Wait for service to go setup, mainly used
     * for tests which might want to await this
     * before starting running tests.
     * @return {undefined}
     * @public
     */
    async awaitSetup() {
        await this.setupDeferred.promise;
    }

    /**
     * Wait for service to go online, mainly used
     * for tests which might want to await this
     * before starting running tests.
     * @return {undefined}
     * @public
     */
    async awaitOnline() {
        await this.onlineDeferred.promise;
    }

    /**
     * Wait for service to go offline, mainly used
     * for tests which might want to await this
     * before starting running tests.
     * @return {undefined}
     * @public
     */
    async awaitOffline() {
        await this.offlineDeferred.promise;
    }

    /**
     * Wait for service to go config update, mainly used
     * for tests which might want to await this
     * before starting running tests.
     * @return {undefined}
     * @public
     */
    async awaitConfigUpdate() {
        await this.configUpdatedDeferred.promise;
    }
}

module.exports = Service;
