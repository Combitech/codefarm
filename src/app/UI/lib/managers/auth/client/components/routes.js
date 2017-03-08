
import React from "react";
import { Route } from "react-router";
import Page from ".";
import ProfilePage from "./ProfilePage";

const routes = [
    // TODO: Move profile elsewhere...
    <Route
        key="profile"
        path="/profile"
        component={ProfilePage}
    />,
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
