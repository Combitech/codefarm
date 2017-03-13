
import React from "react";
import { Route } from "react-router";
import {
    View as TAView
} from "ui-components/type_admin";
import UserList from "./UserList";
import UserItem from "./UserItem";
import UserUpdatePassword from "./UserUpdatePassword";
import TeamList from "./TeamList";
import TeamItem from "./TeamItem";

const routes = [
    <Route
        key="users"
        path="users"
        component={TAView}
        List={UserList}
        type="userrepo.user"
        label="Users"
    >
        <Route
            path=":_id"
            component={TAView}
            Item={UserItem}
            type="userrepo.user"
        >
            <Route
                path="updatepassword"
                component={TAView}
                Action={UserUpdatePassword}
                label="Update Password"
            />
        </Route>
    </Route>,
    <Route
        key="teams"
        path="teams"
        component={TAView}
        List={TeamList}
        type="userrepo.team"
        label="Teams"
    >
        <Route
            path=":_id"
            component={TAView}
            Item={TeamItem}
            type="userrepo.team"
        />
    </Route>
];

export default routes;
