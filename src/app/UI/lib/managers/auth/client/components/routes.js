
import React from "react";
import { Route } from "react-router";
import Page from "./Page";

const routes = [
    <Route
        key="signin"
        path="/signin"
        component={Page}
    />,
    <Route
        key="signout"
        path="/signout"
        component={Page}
    />
];

export default routes;
