
/* global document */

/** Set a cookie
 * @param {String} name Cookie name
 * @param {any} value Cookie value
 * @param {Object} [opts] Cookie options, path or similar...
 * @return {undefined}
 */
const setCookie = (name, value, opts = false) => {
    let optStr = "";
    if (opts) {
        optStr = Object.keys(opts).map((key) =>
            `;${key}=${opts[key]}`
        );
    }
    document.cookie = `${name}=${value}${optStr}`;
};

export {
    setCookie
};
