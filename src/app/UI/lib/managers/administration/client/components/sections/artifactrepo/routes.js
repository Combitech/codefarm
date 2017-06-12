
import React from "react";
import { Route } from "react-router";
import {
    View as TAView,
    Edit as TAEdit,
    Remove as TARemove,
    RemoveForm as TARemoveForm
} from "ui-components/type_admin";
import List from "./List";
import Item from "./Item";
import Edit from "./Edit";

const routes = (
    <Route
        path="artifactrepos"
        component={TAView}
        List={List}
        type="artifactrepo.repository"
        label="Artifact Repositories"
        icon="storage"
    >
        <Route
            path="create"
            component={TAEdit}
            Create={Edit}
            type="artifactrepo.repository"
        />
        <Route
            path=":_id"
            component={TAView}
            Item={Item}
            type="artifactrepo.repository"
        >
            <Route
                path="edit"
                component={TAEdit}
                Edit={Edit}
            />
            <Route
                path="remove"
                component={TARemove}
                Remove={TARemoveForm}
                humanTypeName="artifact repository"
            />
        </Route>
    </Route>
);

export default routes;
