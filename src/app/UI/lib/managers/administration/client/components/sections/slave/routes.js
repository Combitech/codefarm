
import React from "react";
import { Route } from "react-router";
import {
    View as TAView,
    Edit as TAEdit,
    Remove as TARemove,
    EditTags as TAEditTags
} from "ui-components/type_admin";
import List from "./List";
import Item from "./Item";
import Edit from "./Edit";
import Remove from "./Remove";

const routes = (
    <Route
        path="slaves"
        component={TAView}
        List={List}
        type="exec.slave"
        label="Slaves"
    >
        <Route
            path="create"
            component={TAEdit}
            Create={Edit}
            type="exec.slave"
        />
        <Route
            path=":_id"
            component={TAView}
            Item={Item}
            type="exec.slave"
        >
            <Route
                path="edit"
                component={TAEdit}
                Edit={Edit}
            />
            <Route
                path="remove"
                component={TARemove}
                Remove={Remove}
            />
            <Route
                path="tags"
                component={TAView}
                Action={TAEditTags}
                type="exec.slave"
            />
        </Route>
    </Route>
);

export default routes;
