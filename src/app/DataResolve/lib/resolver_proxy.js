"use strict";

const RefResolver = require("./resolvers/ref_resolver");

const resolvers = {
    "RefResolve": RefResolver
};

let instance;

class ResolverProxy {
    constructor() {
    }

    static get instance() {
        if (!instance) {
            instance = new this();
        }

        return instance;
    }

    getResolver(resolverId) {
        if (!(resolverId in resolvers)) {
            throw new Error(`Unknown resolver ${resolverId}`);
        }
        const instance = resolvers[resolverId].instance;

        return instance;
    }

    async validate(resolverId, ...args) {
        const resolver = this.getResolver(resolverId);
        await resolver.validate(...args);
    }

    async resolve(resolverId, ...args) {
        const resolver = this.getResolver(resolverId);

        return resolver.resolve(...args);
    }
}

module.exports = ResolverProxy;
