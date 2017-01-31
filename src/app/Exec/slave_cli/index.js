"use strict";

const main = require("./main");
const log = require("./log");

process.on("uncaughtException", (error) => {
    log.error("Error! Oh, no, we crashed hard!");
    log.error(error);
    log.error(error.stack);
    process.exit(error.code || 255);
});

try {
    main.init(process.argv);
    main.parseArgs(process.argv);
} catch (err) {
    log.error();
    log.error(`  error: ${err.message}`);
    log.error();
    process.exit(1);
}

main.run()
    .catch((err) => {
        log.error("ERROR:", err);
        process.exit(1);
    })
    .then((data) => {
        log.info(data);
        process.exit(0);
    });
