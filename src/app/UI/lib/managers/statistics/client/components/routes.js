
import React from "react";
import { Route } from "react-router";
import {
    View as TAView,
    EditTags as TAEditTags
} from "ui-components/type_admin";
import Item from "./Item";
import List from "./List";

const routes = [
    <Route
        key="charts"
        path="charts"
        component={TAView}
        List={List}
        type="stat.chart"
        label="Statistics"
    >
        <Route
            path=":_id"
            component={TAView}
            Item={Item}
            type="stat.chart"
        >
            <Route
                path="tags"
                component={TAView}
                Action={TAEditTags}
                type="stat.chart"
            />
        </Route>
    </Route>
];

export default routes;
