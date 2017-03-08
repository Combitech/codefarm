"use strict";

const instances = {};

const singleton = (Type) => {
    Object.defineProperty(Type, "instance", {
        get: function() {
            if (!instances[this]) {
                instances[this] = new this();

                const dispose = instances[this].dispose;

                instances[this].dispose = async () => {
                    dispose && await Promise.resolve(dispose.bind(instances[this])());

                    delete instances[this];
                };
            }

            return instances[this];
        }
    });

    return Type;
};

module.exports = singleton;
