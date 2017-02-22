
import React from "react";
import { Route, Redirect, IndexRedirect } from "react-router";
import {
    View as TAView
} from "ui-components/type_admin";
import List from "./List";
import Item from "./Item";

const routes = [
    <Route
        key="artifacts_from_id"
        path=":repository/page/from/:id"
        component={TAView}
        List={List}
        type="artifactrepo.repository"
        label="Artifacts"
    >
        <Redirect from=":_id" to="/artifacts/:repository/:_id" />
    </Route>,
    <Route
        key="artifacts_to_id"
        path=":repository/page/to/:id"
        component={TAView}
        List={List}
        type="artifactrepo.repository"
        label="Artifacts"
    >
        <Redirect from=":_id" to="/artifacts/:repository/:_id" />
    </Route>,
    <Route
        key="repository_redirect"
        path=":repository"
    >
        <IndexRedirect to="page/from/__HEAD__" />,
        <Route
            path=":_id"
            component={TAView}
            Item={Item}
            type="artifactrepo.artifact"
        />
    </Route>
];

export default routes;
