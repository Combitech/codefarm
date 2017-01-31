"use strict";

const clone = require("clone");
const { AsyncEventEmitter } = require("emitter");

/**
 * Class representing a provided interface by a remote service
 */
class ProviderClient extends AsyncEventEmitter {
    /**
     * Create provider client
     * @param {String} config Parameter from the configuration
     * @param {String} params Parameters provided via the service bus
     */
    constructor(config) {
        super();

        this.config = clone(config) || {};
    }

    /**
     * Get the type of the provided interface, must be implemented by
     * the child class
     * @return {string} The name
     * @public
     */
    static get typeName() {
        throw new Error("typeName must be implemented by the child class");
    }

    /**
     * Used in checks to se that child classes are of ProviderClient heritage
     * @return {ProviderClient} The type
     * @public
     */
    static me() {
        return ProviderClient;
    }

    /**
     * Method to implement startup procedure if any,
     * called by the service layer
     * @public
     * @return {undefined}
     */
    async start() {
    }

    /**
     * Method to implement startup procedure if any,
     * called by the service layer
     * @public
     * @return {undefined}
     */
    async startBase() {
        await this.start();
    }

    /**
     * Method to implement dispose procedure if any,
     * called by the service layer
     * @public
     * @return {undefined}
     */
    async dispose() {
        this.removeAllListeners();
    }
}

module.exports = ProviderClient;
