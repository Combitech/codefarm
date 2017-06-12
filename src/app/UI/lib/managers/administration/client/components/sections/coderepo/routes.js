
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
        path="coderepos"
        component={TAView}
        List={List}
        type="coderepo.repository"
        label="Code Repositories"
        icon="storage"
    >
        <Route
            path="create"
            component={TAEdit}
            Create={Edit}
            type="coderepo.repository"
        />
        <Route
            path=":_id"
            component={TAView}
            Item={Item}
            type="coderepo.repository"
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
                humanTypeName="code repository"
            />
        </Route>
    </Route>
);

export default routes;
