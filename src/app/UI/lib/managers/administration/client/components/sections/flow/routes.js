
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
import EditStep from "./EditStep";

const routes = (
    <Route
        path="flows"
        component={TAView}
        List={List}
        type="flowctrl.flow"
        label="Flows"
        icon="device_hub"
    >
        <Route
            path="create"
            component={TAEdit}
            Create={Edit}
            type="flowctrl.flow"
        />
        <Route
            path=":_id"
            component={TAView}
            Item={Item}
            type="flowctrl.flow"
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
                humanTypeName="flow"
            />
            <Route
                path="create"
                component={TAEdit}
                Create={EditStep}
                type="flowctrl.step"
            />
            <Route
                path=":stepId"
                component={TAView}
                type="flowctrl.step"
            >
                <Route
                    path="edit"
                    component={TAEdit}
                    Edit={EditStep}
                />
                <Route
                    path="remove"
                    component={TARemove}
                    Remove={TARemoveForm}
                    humanTypeName="step"
                />
            </Route>
        </Route>
    </Route>
);

export default routes;
