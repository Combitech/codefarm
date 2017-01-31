"use strict";

/** Async function that races the given promise with
 * a promise rejected after the given timeout.
 * @param {Promise} promise Promise
 * @param {Number} timeoutMs Timeout in milliseconds
 * @param {Error} [tmoError] Optional error to throw at timeout
 * @return {Promise} promise that will be resolved after the set time
 * @throws Error given as argument tmoError at timeout
 */
const asyncWithTmo = async (promise, timeoutMs, tmoError = new Error("Timeout expired")) => {
    let timeoutHandle;
    const timeoutPromise = new Promise((resolve, reject) => {
        timeoutHandle = setTimeout(reject.bind(null, tmoError), timeoutMs);
    });

    const result = await Promise.race([ promise, timeoutPromise ]);
    if (timeoutHandle) {
        clearTimeout(timeoutHandle);
    }

    return Promise.resolve(result);
};

module.exports = asyncWithTmo;
