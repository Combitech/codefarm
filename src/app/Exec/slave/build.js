"use strict";

const path = require("path");
const AsyncAwaitPlugin = require("webpack-async-await");

module.exports = {
    entry: {
        slave: "./slave/index.js",
        cli: "./slave_cli/index.js"
    },
    target: "node",
    node: {
        __filename: false,
        __dirname: false
    },
    output: {
        path: path.join(__dirname, "..", "build"),
        filename: "[name].js"
    },
    plugins: [
        new AsyncAwaitPlugin({})
    ],
    resolve: {
        modules: [ "node_modules", "/home/farmer/.node_modules" ]
    }
};
