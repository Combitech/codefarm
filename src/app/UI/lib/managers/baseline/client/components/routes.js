
import React from "react";
import { Route } from "react-router";
import {
    View as TAView,
    EditTags as TAEditTags
} from "ui-components/type_admin";
import List from "./List";
import Item from "./Item";

const routes = (
    <Route
        path=":repository"
        component={TAView}
        Item={List}
        type="baselinerepo.repository"
    >
        <Route
            path=":_id"
            component={TAView}
            Item={Item}
            type="baselinerepo.baseline"
        >
            <Route
                path="tags"
                component={TAView}
                Action={TAEditTags}
                type="baselinerepo.baseline"
            />
        </Route>
    </Route>
);

export default routes;
