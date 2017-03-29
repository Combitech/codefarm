"use strict";

const ServiceMgr = require("./manager");

const crashHandler = (error) => {
    console.error(new Date());
    console.error("Error! Oh, no, we crashed hard!");
    console.error(error);
    console.error(error.stack);
    process.exit(error.code || 255);
};

const promiseWarningHandler = (error, promise) => {
    console.error(new Date());
    console.error("Warning, unhandled promise rejection", error);
    console.error("Promise: ", promise);
    process.exit(error.code || 254);
};

const shutdownHandler = async () => {
    await ServiceMgr.instance.dispose();
    process.exit(0);
};

const DEFAULT_HOOKS = {
    "SIGINT": shutdownHandler,
    "SIGTERM": shutdownHandler,
    "uncaughtException": crashHandler,
    "unhandledRejection": promiseWarningHandler
};

const setupProcessHooks = (hooks = {}) => {
    const hooksToUse = Object.assign({}, DEFAULT_HOOKS, hooks);

    for (const [ hook, handler ] of Object.entries(hooksToUse)) {
        process.on(hook, handler);
    }
};

module.exports = { setupProcessHooks, crashHandler };
