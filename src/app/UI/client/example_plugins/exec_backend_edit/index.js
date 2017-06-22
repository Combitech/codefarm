"use strict";

import { PluginBase, registerPlugin } from "ui-lib/plugin_util";
import Backend1Edit from "./Backend1Edit";

const props = {
    "exec.backend.edit.types": [ {
        value: "backend1", label: "Backend 1"
    } ],
    "exec.backend.edit.component.backend1": Backend1Edit
};

class ExecBackend1EditPlugin extends PluginBase {
    constructor(name) {
        super(name, props);
    }
}

registerPlugin("ExecBackend1Edit", ExecBackend1EditPlugin);
