
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
import StatItem from "./StatItem";
import Edit from "./Edit";
import Remove from "./Remove";

const routes = (
    <Route
        path="stats"
        component={TAView}
        List={List}
        type="stat.spec"
        label="Statistics"
        icon="show_chart"
    >
        <Route
            path="create"
            component={TAEdit}
            Create={Edit}
            type="stat.spec"
        />
        <Route
            path=":_id"
            component={TAView}
            Item={Item}
            type="stat.spec"
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
                path=":_id_stat"
                component={TAView}
                Item={StatItem}
                type="stat.stat"
            />
            <Route
                path="tags"
                component={TAView}
                Action={TAEditTags}
                type="stat.spec"
            />
        </Route>
    </Route>
);

export default routes;
