"use strict";

const winston = require("winston");

const log = new winston.Logger({
    transports: [
        new (winston.transports.Console)({
            name: "console",
            prettyPrint: true,
            timestamp: true,
            level: "debug",
            silent: false
        })
    ]
});

log.configure = async (level) => {
    // TODO: The level isn't changed when run from a production mode installation (npm install --production).
    log.transports.console.level = level || log.transports.console.level;
    log.transports.console.silent = level === false;
};

module.exports = log;
