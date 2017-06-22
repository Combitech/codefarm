"use strict";

const { notification } = require("typelib");
const log = require("log");
const singleton = require("singleton");
const fs = require("fs-extra-promise");
const path = require("path");
const findDirsWithEntry = require("./find_dirs_with_entry");

const BACKEND_ENTRY_FILE = "index.js";

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

    getBackendClass(typeName) {
        if (!(typeName in this.backendClasses)) {
            throw new Error(`Unknown backend type ${typeName}`);
        }

        return this.backendClasses[typeName];
    }

    async _addBackend(backend) {
        const typeName = backend.backendType;
        const BackendClass = this.getBackendClass(typeName);

        this.backends[backend._id] = new BackendClass(
            backend._id,
            backend,
            ...this.backendConstructorArgs
        );

        log.info(`Starting backend ${backend._id} of type ${typeName}`);
        try {
            await this.backends[backend._id].start();
        } catch (error) {
            log.error(`Error starting backend ${backend._id} of type ${typeName}`, error);
            throw error;
        }
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
        const backendTypes = Object.assign({}, config.types);

        if (config.searchPaths) {
            for (const backendDir of config.searchPaths) {
                const backendEntries = await findDirsWithEntry(backendDir, BACKEND_ENTRY_FILE);
                for (const entry of backendEntries) {
                    try {
                        const backend = require(entry.path);
                        log.info(`Loaded backend ${entry.name} at ${entry.dir}`);
                        backendTypes[entry.name] = backend;
                    } catch (error) {
                        log.error(`Failed to load backend at ${entry.dir}`, error);
                    }
                }
            }
        }

        if (backendTypes) {
            for (const typeKey of Object.keys(backendTypes)) {
                this.backendClasses[typeKey] = backendTypes[typeKey];
            }
        }

        // Read configured backends from database
        const backends = await this.BackendType.findMany();
        if (backends) {
            for (const backend of backends) {
                await this._addBackend(backend);
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
