"use strict";

/* global it */

module.exports = () => {
    if (it) {
        const orgIt = it;

        it = function(name, fn) { // eslint-disable-line no-global-assign
            orgIt(name, function() {
                return fn.bind(this)(this); // eslint-disable-line no-invalid-this
            });
        };
    }
};
