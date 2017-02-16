"use strict";

const Database = require("database");
const { v4: uuid } = require("uuid");

const factory = {
    start: async () => {
        await factory.dispose();

        factory.instance = new Database({
            testMode: true
        }, { serviceName: `MyDB-${uuid()}` });

        await factory.instance.start();

        return factory.instance;
    },
    dispose: async () => {
        if (factory.instance) {
            await factory.instance.dispose();
            factory.instance = null;
        }
    }
};

module.exports = factory;
