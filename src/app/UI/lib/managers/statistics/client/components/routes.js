
import React from "react";
import { Route } from "react-router";
import {
    View as TAView
} from "ui-components/type_admin";
import Item from "./Item";
import List from "./List";

const routes = [
    <Route
        key="list"
        path="list"
        component={TAView}
        List={List}
        type="stat.stat"
        label="Statistics"
    />,
    <Route
        key="stat"
        path=":_id"
        component={TAView}
        Item={Item}
        type="stat.stat"
    />
];

export default routes;
