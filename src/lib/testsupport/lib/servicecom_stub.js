"use strict";

/** Function that sets up a response to a request matching the given criteria
    on the service com bus.
 * @param {Object} ServiceComBus object
 * @param {String} method request object method to match
 * @param {String} typeName request object typeName to match
 * @param {String} result response result (typically "success")
 * @param {String} data response data
 * @return {null} Nothing
 */
module.exports = (ServiceComBus, method, typeName, result, data) => {
    ServiceComBus.instance.addListener("request", async (event) => {
        if (event.data.method === method && event.data.typeName === typeName) {
            ServiceComBus.instance.respond(event, data, result);
        }
    });
};
