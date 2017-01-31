"use strict";

class Deferred {
    constructor() {
        this.resolved = false;
        this.rejected = false;
        this.promise = new Promise((resolve, reject) => {
            this.resolve = (...args) => {
                this.rejected = false;
                this.resolved = true;

                return resolve(...args);
            };
            this.reject = (...args) => {
                this.rejected = true;
                this.resolved = false;

                return reject(...args);
            };
        });
    }
}

module.exports = Deferred;
