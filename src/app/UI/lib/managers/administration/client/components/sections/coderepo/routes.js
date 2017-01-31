
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
        path="coderepos"
        component={TAView}
        List={List}
        type="coderepo.repository"
        label="Code Repositories"
    >
        <Route
            path="create"
            component={TAEdit}
            Create={Edit}
            type="coderepo.repository"
        />
        <Route
            path=":repositoryId"
            component={TAView}
            Item={Item}
            type="coderepo.repository"
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
