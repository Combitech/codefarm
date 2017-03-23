
import React from "react";
import { Route, IndexRedirect } from "react-router";
import MtmtPageServiceMonitor from "./Page";
import ServiceMonitorPageItem from "./MonitorPage";

const routes = (
    <Route
        path="servicemonitor"
        label="Service Monitor"
        component={MtmtPageServiceMonitor}
        icon="track_changes"
    >
        <IndexRedirect to="graph" />
        <Route path="graph" component={ServiceMonitorPageItem} />
        <Route path="table" component={ServiceMonitorPageItem} />
    </Route>
);

export default routes;
