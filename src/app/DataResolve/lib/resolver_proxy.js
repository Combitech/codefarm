"use strict";

const singleton = require("singleton");
const RefResolver = require("./resolvers/ref_resolver");
const BaselineFlowsResolver = require("./resolvers/baseline_flows_resolver");

const resolvers = {
    "RefResolve": RefResolver,
    "BaselineFlowsResolve": BaselineFlowsResolver
};

class ResolverProxy {
    constructor() {
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

module.exports = singleton(ResolverProxy);
