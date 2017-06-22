"use strict";

const plugins = [];

const registerPlugin = (name, PluginClass) => {
    plugins.push({
        name,
        PluginClass
    });
};

const getRegisteredPluginNames = () => plugins
    .map((p) => p.name);

const startPlugins = async (...args) => {
    for (const plugin of plugins) {
        console.log(`Creating and starting plugin ${plugin.name}...`);
        plugin.instance = new plugin.PluginClass(plugin.name);
        await Promise.resolve(plugin.instance.start(args));
    }
};

const getPluginProp = (key) => plugins
    .filter((p) => p.instance)
    .map((p) => p.instance.getProp(key))
    .filter((v) => v != null); // eslint-disable-line eqeqeq,no-eq-null

class PluginBase {
    constructor(name, props = {}) {
        this._name = name;
        this._props = props;
    }

    log(msg) {
        console.log(`Plugin[${this.getName()}]: ${msg}`);
    }

    /**
     * Override method in child class if needed
     * @return {undefined}
     */
    async start() {
        this.log("Starting...");
    }

    getName() {
        return this._name;
    }

    getProp(key) {
        return this._props[key];
    }
}

export {
    registerPlugin,
    getRegisteredPluginNames,
    startPlugins,
    getPluginProp,
    PluginBase
};
