import React from "react";
import { Route, IndexRoute, IndexRedirect } from "react-router";
import Layout from "ui-components/app_layout";
import IndexPage from "ui-components/IndexPage";
import NotFoundPage from "ui-components/NotFoundPage";
import AuthPage from "ui-mgr/auth/client/components";
import CodePage from "ui-mgr/code/client/components";
import ArtifactsPage from "ui-mgr/artifacts/client/components";
import UsersPage from "ui-mgr/users/client/components";
import PlaygroundPage from "ui-mgr/playground/client/components";
import AdminPage from "ui-mgr/administration/client/components";
import MgmtPage from "ui-mgr/mgmt/client/components";

import MtmtPageServiceMonitor, { MonitorPage as ServiceMonitorPageItem } from "ui-mgr/mgmt/client/components/sections/servicemonitor";
import MtmtPageEventMonitor from "ui-mgr/mgmt/client/components/sections/eventmonitor";

import codePageRoutes from "ui-mgr/code/client/components/routes";
import artifactsPageRoutes from "ui-mgr/artifacts/client/components/routes";
import usersPageRoutes from "ui-mgr/users/client/components/routes";

import adminPageCoderepoRoutes from "ui-mgr/administration/client/components/sections/coderepo/routes";
import adminPageArtifactrepoRoutes from "ui-mgr/administration/client/components/sections/artifactrepo/routes";
import adminPageLogrepoRoutes from "ui-mgr/administration/client/components/sections/logrepo/routes";
import adminPageFlowRoutes from "ui-mgr/administration/client/components/sections/flow/routes";
import adminPageJobRoutes from "ui-mgr/administration/client/components/sections/job/routes";
import adminPageSlaveRoutes from "ui-mgr/administration/client/components/sections/slave/routes";
import adminPageBaselineRoutes from "ui-mgr/administration/client/components/sections/baseline/routes";
import mgmtPageUserrepoRoutes from "ui-mgr/mgmt/client/components/sections/userrepo/routes";
import mgmtPageCoderepoRoutes from "ui-mgr/mgmt/client/components/sections/coderepo/routes";
import mgmtPageArtifactrepoRoutes from "ui-mgr/mgmt/client/components/sections/artifactrepo/routes";
import mgmtPageLogrepoRoutes from "ui-mgr/mgmt/client/components/sections/logrepo/routes";

const routes = (
    <Route path="/" component={Layout}>
        <IndexRoute component={IndexPage} />
        <Route path="login" component={AuthPage} />
        <Route path="admin" component={AdminPage}>
            <IndexRedirect to={adminPageCoderepoRoutes.props.path} />

            {adminPageCoderepoRoutes}
            {adminPageArtifactrepoRoutes}
            {adminPageLogrepoRoutes}
            {adminPageBaselineRoutes}
            {adminPageFlowRoutes}
            {adminPageSlaveRoutes}
            {adminPageJobRoutes}
        </Route>
        <Route path="management" component={MgmtPage}>
            <IndexRedirect to="servicemonitor" />

            <Route
                path="servicemonitor"
                label="Service Monitor"
                component={MtmtPageServiceMonitor}
            >
                <IndexRedirect to="graph" />
                <Route path="graph" component={ServiceMonitorPageItem} />
                <Route path="table" component={ServiceMonitorPageItem} />
            </Route>

            <Route
                path="eventmonitor"
                label="Event Monitor"
                component={MtmtPageEventMonitor}
            />

            {mgmtPageUserrepoRoutes}
            {mgmtPageCoderepoRoutes}
            {mgmtPageArtifactrepoRoutes}
            {mgmtPageLogrepoRoutes}
        </Route>
        <Route path="code" component={CodePage}>
            {codePageRoutes}
        </Route>
        <Route path="artifacts" component={ArtifactsPage}>
            {artifactsPageRoutes}
        </Route>
        <Route path="collaborators" component={UsersPage}>
            <IndexRedirect to={usersPageRoutes[0].props.path} />
            {usersPageRoutes}
        </Route>
        <Route path="playground" component={PlaygroundPage} />

        <Route path="*" component={NotFoundPage}/>
    </Route>
);

export default routes;
