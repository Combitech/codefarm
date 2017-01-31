"use strict";

/* global it */

module.exports = () => {
    if (it) {
        const orgIt = it;

        it = function(name, fn) {
            orgIt(name, function() {
                return fn.bind(this)(this);
            });
        }
    }
};
