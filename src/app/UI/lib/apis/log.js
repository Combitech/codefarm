"use strict";

const api = require("api.io");
const { LogClient } = require("loglib");
const singleton = require("singleton");

const logApiExports = api.register("log", {
    subscribe: api.export(async (session, id) => {
        // TODO: Check token: const token = session.user && session.user.token;

        const subscription = await LogClient.instance.subscribe(id, async (line) => {
            logApiExports.emit("line", { id: id, line: line });
        });

        session.logSubscriptions.push(subscription);

        return subscription;
    }),
    unsubscribe: api.export(async (session, subscription) => {
        session.logSubscriptions = session.logSubscriptions.filter((s) => s !== subscription);

        await LogClient.instance.unsubscribe(subscription);
    })
});

class LogApi {
    constructor() {
        this.exports = logApiExports;
    }

    clientConnected(client) {
        client.session.logSubscriptions = [];
    }

    clientDisconnected(client) {
        for (const subscription of client.session.logSubscriptions) {
            LogClient.instance.unsubscribe(subscription).
            catch((error) => {
                console.error(error);
            });
        }
    }

    async start() {
    }

    async dispose() {
    }
}

module.exports = singleton(LogApi);
