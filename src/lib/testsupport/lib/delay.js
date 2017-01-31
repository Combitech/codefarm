"use strict";

/** Async function that wraps a setTimeout.
 * The returned promise is resolved once the timeout expires.
 * @param {Number} timeMs Delay time in milliseconds
 * @return {Promise} promise that will be resolved after the set time
 */
module.exports = async (timeMs) => new Promise((resolve) => setTimeout(resolve, timeMs));
