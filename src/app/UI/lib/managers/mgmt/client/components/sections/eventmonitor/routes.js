
import React from "react";
import { Route } from "react-router";
import MtmtPageEventMonitor from "./Page";

const routes = (
    <Route
        path="eventmonitor"
        label="Event Monitor"
        component={MtmtPageEventMonitor}
        icon="visibility"
    />
);

export default routes;
