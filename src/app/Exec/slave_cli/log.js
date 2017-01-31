"use strict";

let verbose = false;

module.exports = {
    verbose: (...args) => {
        if (verbose) {
            console.log(...args);
        }
    },
    info: (...args) => {
        console.log(...args);
    },
    error: (...args) => {
        console.error(...args);
    },
    setVerbose: (enableVerbose = true) => {
        verbose = enableVerbose;
    }
};
