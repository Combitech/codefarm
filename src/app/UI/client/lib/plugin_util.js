"use strict";

const plugins = [];

const registerPlugin = (plugin) => {
    plugins.push({
        PluginClass: plugin
    });
};

const getRegisteredPluginNames = () => plugins
    .map((p) => p.PluginClass.getName());

const startPlugins = async (...args) => {
    for (const plugin of plugins) {
        console.log(`Starting plugin ${plugin.PluginClass.getName()}...`);
        plugin.instance = new plugin.PluginClass();
        await Promise.resolve(plugin.instance.start(args));
    }
};

const getPluginProp = (key) => plugins
    .map((p) => p.PluginClass.getProp(key))
    .filter((v) => v != null); // eslint-disable-line eqeqeq,no-eq-null

export {
    registerPlugin,
    getRegisteredPluginNames,
    startPlugins,
    getPluginProp
};
