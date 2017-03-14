"use strict";

const os = require("os");
const moment = require("moment");
const MsgBus = require("msgbus");
const { AsyncEventEmitter } = require("emitter");
const { Deferred } = require("misc");
const singleton = require("singleton");
const log = require("log");
const { Token } = require("auth");
const MbClient = require("./mb_client");

class ServiceComBus extends AsyncEventEmitter {
    constructor() {
        super();

        this.config = {};
        this.clients = {};
        this.msgbus = false;
        this.requests = [];
        this.serviceStatistics = {};
    }

    async start(config) {
        this.config = config;

        const opts = {
            uri: config.uri,
            routingKey: config.name,
            noSynchronize: true,
            exchange: {
                name: "servicecom",
                type: "topic",
                options: {
                    durable: true
                }
            },
            queue: {
                name: `${config.name}-servicecom`,
                options: {
                    durable: true
                }
            },
            testMode: config.testMode
        };

        this.msgbus = new MsgBus(opts);

        this.msgbus.on("data", this._onData.bind(this));

        // If in test mode put bus in loop mode
        if (config.testMode) {
            this.msgbus.on("publish", async (data) => {
                process.nextTick(() => {
                    this.msgbus.emit("data", data);
                });
            });
        }

        await this.msgbus.start();
    }

    _incServiceStatistic(targetService, stats) {
        if (!(targetService in this.serviceStatistics)) {
            this.serviceStatistics[targetService] = {};
        }
        const serviceStats = this.serviceStatistics[targetService];
        for (const [ statKey, statInc ] of Object.entries(stats)) {
            if (!(statKey in serviceStats)) {
                serviceStats[statKey] = 0;
            }

            serviceStats[statKey] = serviceStats[statKey] + statInc;
            serviceStats[`${statKey}.modified`] = moment().utc().format();
        }
    }

    async _authenticate(message) {
        let tokenData = false;
        const msgSrc = message.source && message.source.service;
        const name = this.config.name;
        if (message.token) {
            const publicKey = this.config.publicKey;

            try {
                tokenData = await Token.instance.verifyToken(message.token, { publicKey });
                // Validate message source
                if (tokenData.type === Token.TOKEN_TYPE.SERVICE) {
                    if (tokenData.src !== msgSrc) {
                        throw new Error(`Expected src ${tokenData.src}, got ${msgSrc}`);
                    }
                } else if (tokenData.type === Token.TOKEN_TYPE.USER) {
                    // Nothing to verify for user here...
                } else {
                    throw new Error(`Unsupported token type ${tokenData.type}`);
                }
            } catch (error) {
                log.error(`${name} received faulty token from ${msgSrc}`, error.message, message);
            }
        } else {
            log.debug(`${name} received no token from ${msgSrc}`, message);
        }

        return tokenData;
    }

    async _onData(message) {
        if (!this.config.testMode && (message.type === "response" || message.type === "request")) {
            message._tokenData = await this._authenticate(message);
            if (!message._tokenData) {
                log.error(`${this.config.name} received unauthorized ${message.type} ` +
                    `from ${message.source.service}, message dropped`);

                return;
            }
        }
        if (message.type === "response") {
            const pending = this._retreivePendingRequest(message._id);

            if (!pending) {
                return;
            }

            if (message.result !== "success") {
                console.log("failed", message);
                const error = new Error(message.data);
                error.status = message.status;

                this._incServiceStatistic(pending.targetService, { "responsesNotOk": 1 });
                pending.deferred.reject(error);
            } else {
                this._incServiceStatistic(pending.targetService, { "responsesOk": 1 });
                pending.deferred.resolve(message.data);
            }
        } else if (message.type === "request") {
            await this.emit("request", message);
        }
    }

    _addPendingRequest(pending) {
        this.requests.push(pending);
        this._incServiceStatistic(pending.targetService, { "requestsSent": 1 });

        if (pending.timeout) {
            pending.timer = setTimeout(() => {
                const r = this._retreivePendingRequest(pending.request._id);

                if (r) {
                    console.error(`Request to ${r.targetService} timed out `, JSON.stringify(pending.request, null, 2));
                    this._incServiceStatistic(r.targetService, { "timeouts": 1 });
                    r.deferred.reject("Request timed out");
                }
            }, pending.timeout);
        }
    }

    _retreivePendingRequest(id) {
        const index = this.requests.findIndex((request) => request.request._id === id);

        if (index === -1) {
            return false;
        }

        const pending = this.requests.splice(index, 1)[0];

        if (pending.timer) {
            clearTimeout(pending.timer);
            pending.timer = null;
        }

        return pending;
    }

    async request(targetService, data, opts = {}) {
        const pendingRequest = {
            request: {
                _id: this.msgbus.constructor.generateId(),
                time: moment().utc().format(),
                token: opts.token || this.config.token, // Use configured token if none specified
                type: "request",
                data: data,
                timeout: opts.timeout,
                source: {
                    hostname: os.hostname(),
                    service: this.msgbus.getRoutingKey()
                }
            },
            timeout: opts.timeout,
            deferred: new Deferred(),
            targetService: targetService
        };

        this._addPendingRequest(pendingRequest);

        await this.msgbus.publishRaw(pendingRequest.request, targetService, opts.timeout);

        return pendingRequest.deferred.promise;
    }

    async respond(request, data, result = "success", status = 200) {
        const response = {
            _id: request._id,
            time: moment().utc().format(),
            token: this.config.token,
            type: "response",
            data: data,
            result: result,
            status: status,
            source: {
                hostname: os.hostname(),
                service: this.msgbus.getRoutingKey()
            }
        };

        await this.msgbus.publishRaw(response, request.source.service);
    }

    getClient(serviceName) {
        return this.clients[serviceName] = (this.clients[serviceName] || new MbClient(serviceName, this));
    }

    attachControllers(controllers) {
        for (const controller of controllers) {
            controller.setMb(this);
        }
    }

    get status() {
        const status = {};
        for (const req of this.requests) {
            if (!(req.targetService in status)) {
                status[req.targetService] = {
                    numPending: 0,
                    oldestPending: false
                };
            }
            const serviceStatus = status[req.targetService];
            serviceStatus.numPending++;
            if (!serviceStatus.oldestPending ||
                moment(req.request.time).isBefore(moment(serviceStatus.oldestPending))) {
                serviceStatus.oldestPending = req.request.time;
            }
        }

        // Statistics
        for (const [ service, stats ] of Object.entries(this.serviceStatistics)) {
            if (!(service in status)) {
                status[service] = {};
            }
            Object.assign(status[service], stats);
        }

        return status;
    }

    async dispose() {
        this.removeAllListeners();

        if (this.msgbus) {
            await this.msgbus.dispose();
            this.msgbus = false;
        }

        this.config = {};
        this.clients = {};
    }
}

module.exports = singleton(ServiceComBus);
