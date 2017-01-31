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

window.onload = () => {
    console.log("Connecting to backend...", params);
    api.connect(params)
    .then(() => {
        console.log(`Connected to backend, available APIs are ${Object.keys(JSON.parse(JSON.stringify(api))).join(", ")}`);
        ReactDOM.render(<AppRoutes routes={routes} />, document.getElementById("main"));
    })
    .catch((error) => {
        console.error("Failed to connect to backend", error);
    });
};
