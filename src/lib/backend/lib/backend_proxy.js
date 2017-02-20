"use strict";

const { notification } = require("typelib");
const log = require("log");
const singleton = require("singleton");

class BackendProxy {
    constructor(BackendType) {
        this.BackendType = BackendType;
        this.backends = {};
        this.backendClasses = {};
    }

    getBackend(name) {
        const instance = this.backends[name];

        if (!instance) {
            throw new Error(`Unknown backend name ${name}`);
        }

        return instance;
    }

    async _addBackend(backend) {
        const typeName = backend.backendType;

        if (!(typeName in this.backendClasses)) {
            throw new Error(`Unknown backend type ${typeName}`);
        }

        this.backends[backend._id] = new this.backendClasses[typeName](
            backend._id,
            backend,
            ...this.backendConstructorArgs
        );

        log.info(`Starting backend ${backend._id} of type ${typeName}`);
        await this.backends[backend._id].start();
    }

    async _updateBackend(backend) {
        const typeName = backend.backendType;

        if (!(typeName in this.backendClasses)) {
            throw new Error(`Unknown backend type ${typeName}`);
        }

        // TODO: Handle update of backends
        log.error(`Updated of backend ${backend._id} of type ${typeName} not supported`);
    }

    async _removeBackend(backend) {
        const typeName = backend.backendType;

        if (!(typeName in this.backendClasses)) {
            throw new Error(`Unknown backend type ${typeName}`);
        }

        if (!(backend._id in this.backends)) {
            throw new Error(`Backend ${backend._id} of type ${typeName} doesn't exist`);
        }

        const instance = this.getBackend(backend._id);
        await instance.dispose();
        delete this.backends[backend._id];

        log.info(`Removed backend ${backend._id} of type ${typeName}`);
    }

    async start(config, ...backendConstructorArgs) {
        // Save constructor arguments for later use when adding backends
        this.backendConstructorArgs = backendConstructorArgs;

        // Add backend types from config
        if (config.types) {
            for (const typeKey of Object.keys(config.types)) {
                this.backendClasses[typeKey] = config.types[typeKey];
            }
        }

        // Read configured backends from database
        const backends = await this.BackendType.findMany();
        if (backends) {
            for (const backend of backends) {
                this._addBackend(backend);
            }
        }

        // Listen to backends created after start
        const addBackendEventHandler = this._addBackend.bind(this);
        notification.on(`${this.BackendType.typeName}.created`, addBackendEventHandler);
        this.addBackendEventHandler = addBackendEventHandler;

        const updateBackendEventHandler = this._updateBackend.bind(this);
        notification.on(`${this.BackendType.typeName}.updated`, updateBackendEventHandler);
        this.updateBackendEventHandler = updateBackendEventHandler;

        const removeBackendEventHandler = this._removeBackend.bind(this);
        notification.on(`${this.BackendType.typeName}.removed`, removeBackendEventHandler);
        this.removeBackendEventHandler = removeBackendEventHandler;
    }

    async dispose() {
        for (const name of Object.keys(this.backends)) {
            await this.backends[name].dispose();
        }
        if (this.addBackendEventHandler) {
            notification.removeListener(`${this.BackendType.typeName}.created`, this.addBackendEventHandler);
            this.addBackendEventHandler = null;
        }
        if (this.updateBackendEventHandler) {
            notification.removeListener(`${this.BackendType.typeName}.updated`, this.updateBackendEventHandler);
            this.updateBackendEventHandler = null;
        }
        if (this.removeBackendEventHandler) {
            notification.removeListener(`${this.BackendType.typeName}.removed`, this.removeBackendEventHandler);
            this.removeBackendEventHandler = null;
        }
    }
}

module.exports = singleton(BackendProxy);
