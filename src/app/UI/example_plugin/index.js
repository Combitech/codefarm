"use strict";

import { registerPlugin } from "ui-lib/plugin_util";
// TODO: Doesn't work for some reason...
// import Backend1Edit from "./Backend1Edit";

const props = {
    "exec.backend.edit.types": [ {
        value: "backend1", label: "Backend 1"
    } ]
    // "exec.backend.edit.component.backend1": Backend1Edit
};

class ExamplePlugin {
    constructor() {
        console.log("Example plugin constructed");
    }

    static getName() {
        return "ExamplePlugin";
    }

    async start() {
        console.log("Example plugin starting...");
    }

    static getProp(key) {
        return props[key];
    }

    static getComponent(key) {
        return components[key];
    }
}

registerPlugin(ExamplePlugin);
