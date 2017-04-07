"use strict";

/* global window document location */

import React from "react";
import ReactDOM from "react-dom";
import AppRoutes from "ui-components/AppRoutes";
import bluebird from "bluebird";
import api from "api.io/api.io-client";
import routes from "./routes";
import "react-toolbox/lib/commons.scss";
// Add global styles to html head
import "ui-styles/global.scss";
import ActiveUser from "ui-observables/active_user";

// https://github.com/petkaantonov/bluebird/issues/903
// https://github.com/babel/babel/issues/3922
// https://github.com/tj/co/pull/256#issuecomment-168475913
bluebird.config({
    warnings: false
});

console.log("UI client starting...");

const params = {
    hostname: location.hostname,
    port: location.port,
    secure: location.protocol.includes("https")
};

const serverInfo = {};

const checkServerInfo = () => {
    api.info.get()
    .then((info) => {
        console.log(`Server version is ${info.version}`);

        if (serverInfo.version && serverInfo.version !== info.version) {
            console.log("Server has updated to new version, reloading...");
            document.location.reload();

            return;
        }

        Object.assign(serverInfo, info);
    })
    .catch((error) => {
        console.error("Failed to check server info", error);
    });
};

window.onload = () => {
    console.log("Connecting to backend...", params);
    api.connect(params, (status, message) => {
        if (status === "timeout") {
            console.error(message);
        } else if (status === "disconnect") {
            console.error("Disconnected from server, will attempt to reconnect...");
        } else if (status === "reconnect") {
            console.log("Reconnected to server");

            checkServerInfo();
        }
    })
    .then(() => {
        console.log(`Connected to backend, available APIs are ${Object.keys(JSON.parse(JSON.stringify(api))).join(", ")}`);

        checkServerInfo();

        ActiveUser.instance.start();
        ReactDOM.render(<AppRoutes routes={routes} />, document.getElementById("main"));
    })
    .catch((error) => {
        console.error("Failed to connect to backend", error);
    });
};
