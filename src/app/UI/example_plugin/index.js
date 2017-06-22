"use strict";

import { registerPlugin } from "ui-lib/plugin_util";
import Backend1Edit from "./Backend1Edit";

const props = {
    "exec.backend.edit.types": [ {
        value: "backend1", label: "Backend 1"
    } ],
    "exec.backend.edit.component.backend1": Backend1Edit
};

class ExamplePlugin {
    constructor() {
        this.log("Constructed");
    }

    log(msg) {
        console.log(`Plugin(${this.constructor.getName()}): ${msg}`);
    }

    static getName() {
        return "ExamplePlugin";
    }

    async start() {
        this.log("Starting...");
    }

    static getProp(key) {
        return props[key];
    }
}

registerPlugin(ExamplePlugin);
