"use strict";

const delay = require("./delay");

module.exports = async (asyncCond, numRetries = 10, pollInterval = 100) => {
    let numRetriesLeft = numRetries;
    let res;

    while (!(res = await asyncCond()) && numRetriesLeft > 0) {
        numRetriesLeft--;
        await delay(pollInterval);
    }

    return res;
};
