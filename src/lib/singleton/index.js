"use strict";

const instances = {};

const singleton = (Type) => {
    Object.defineProperty(Type, "instance", {
        get: function() {
            if (!instances[this]) {
                instances[this] = new this();
            }

            return instances[this];
        }
    });

    return Type;
};

module.exports = singleton;
