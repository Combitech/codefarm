
import React from "react";
import { Route } from "react-router";
import {
    View as TAView,
    Edit as TAEdit,
    Remove as TARemove
} from "ui-components/type_admin";
import List from "./List";
import Item from "./Item";
import Edit from "./Edit";
import Remove from "./Remove";

const routes = (
    <Route
        path="baselinerepobackends"
        component={TAView}
        List={List}
        type="baselinerepo.backend"
        label="Baseline Repository Backends"
        icon="storage"
    >
        <Route
            path="create"
            component={TAEdit}
            Create={Edit}
            type="baselinerepo.backend"
        />
        <Route
            path=":_id"
            component={TAView}
            Item={Item}
            type="baselinerepo.backend"
        >
            {/* <Route
                path="edit"
                component={TAEdit}
                Edit={Edit}
            />*/}
            <Route
                path="remove"
                component={TARemove}
                Remove={Remove}
            />
        </Route>
    </Route>
);

export default routes;
