
import React from "react";
import { Route } from "react-router";
import { AuthPage } from "./index";

const routes = [
    <Route
        key="signin"
        path="/signin"
        component={AuthPage}
    />,
    <Route
        key="signout"
        path="/signout"
        component={AuthPage}
    />
];

export default routes;
