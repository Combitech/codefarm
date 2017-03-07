
import cookie from "cookie";

/* global document */

/** Set a cookie
 * @param {String} name Cookie name
 * @param {any} value Cookie value
 * @param {Object} [opts] Cookie options, path or similar...
 * @return {undefined}
 */
const setCookie = (name, value, opts = {}) => {
    document.cookie = cookie.serialize(name, value, opts);
};

export {
    setCookie
};
