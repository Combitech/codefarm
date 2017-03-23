
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
import EditStep from "./EditStep";

const routes = (
    <Route
        path="flows"
        component={TAView}
        List={List}
        type="flowctrl.flow"
        label="Flows"
        icon="timeline"
    >
        <Route
            path="create"
            component={TAEdit}
            Create={Edit}
            type="flowctrl.flow"
        />
        <Route
            path=":flowId"
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
                Remove={Remove}
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
                    Remove={Remove}
                />
            </Route>
        </Route>
    </Route>
);

export default routes;
