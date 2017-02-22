
import React from "react";
import { Route, Redirect, IndexRedirect } from "react-router";
import {
    View as TAView,
    Edit as TAEdit,
    Remove as TARemove
} from "ui-components/type_admin";
import List from "./List";
import JobItem from "./JobItem";
import SubJobItem from "./SubJobItem";
import Edit from "./Edit";
import Remove from "./Remove";

const routes = (
    <Route
        path="jobs"
        label="Jobs"
    >
        <IndexRedirect to="page/from/__HEAD__" />
        <Route
            path="page/from/:id"
            component={TAView}
            List={List}
            type="exec.job"
            label="Jobs"
        >
            <Redirect from=":_id" to="/admin/jobs/:_id" />
        </Route>
        <Route
            path="page/to/:id"
            component={TAView}
            List={List}
            type="exec.job"
            label="Jobs"
        >
            <Redirect from=":_id" to="/admin/jobs/:_id" />
        </Route>
        <Route
            path="create"
            component={TAEdit}
            Create={Edit}
            type="exec.job"
        />
        <Route
            path=":_id"
            component={TAView}
            Item={JobItem}
            type="exec.job"
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
            <Route
                path=":subJobId"
                component={TAView}
                Item={SubJobItem}
                type="exec.subjob"
            />
        </Route>
    </Route>
);

export default routes;
