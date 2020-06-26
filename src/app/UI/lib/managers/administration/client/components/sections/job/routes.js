
import React from "react";
import { Route } from "react-router";
import {
    View as TAView,
    Edit as TAEdit,
    Remove as TARemove,
    RemoveForm as TARemoveForm
} from "ui-components/type_admin";
import JobList from "./JobList";
import JobItem from "./JobItem";
import JobSpecList from "./JobSpecList";
import JobSpecItem from "./JobSpecItem";
import JobSpecEdit from "./JobSpecEdit";

const routes = (
    [
        <Route
            key="jobspecs"
            path="jobspecs"
            component={TAView}
            List={JobSpecList}
            type="exec.jobspec"
            label="Job Specifications"
            icon="assignment"
        >
            <Route
                path="create"
                component={TAEdit}
                Create={JobSpecEdit}
                type="exec.jobspec"
            />
            <Route
                path=":_id"
                component={TAView}
                Item={JobSpecItem}
                type="exec.jobspec"
            >
                <Route
                    path="edit"
                    component={TAEdit}
                    Edit={JobSpecEdit}
                />
                <Route
                    path="remove"
                    component={TARemove}
                    Remove={TARemoveForm}
                    humanTypeName="job specification"
                />
            </Route>
        </Route>,
        <Route
            key="jobs"
            path="jobs"
            component={TAView}
            List={JobList}
            type="exec.job"
            label="Job Runs"
            icon="assignment"
        >
            <Route
                path=":_id"
                component={TAView}
                Item={JobItem}
                type="exec.job"
            >
                <Route
                    path="remove"
                    component={TARemove}
                    Remove={TARemoveForm}
                    humanTypeName="job"
                />
            </Route>
        </Route>
    ]
);

export default routes;
