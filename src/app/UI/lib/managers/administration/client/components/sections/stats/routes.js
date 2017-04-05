
import React from "react";
import { Route } from "react-router";
import {
    View as TAView,
    Edit as TAEdit,
    Remove as TARemove,
    EditTags as TAEditTags
} from "ui-components/type_admin";
import List from "./List";
import Item from "./Item";
import StatItem from "./StatItem";
import StatDataExplore from "./StatDataExplore";
import ChartItem from "./ChartItem";
import Edit from "./Edit";
import Remove from "./Remove";
import SpecListItem from "./SpecListItem";
import ChartListItem from "./ChartListItem";

const routes = [
    <Route
        key="specs"
        path="stats"
        component={TAView}
        List={List}
        type="stat.spec"
        ListItemComponent={SpecListItem}
        label="Statistics"
        icon="trending_up"
    >
        <Route
            path="create"
            component={TAEdit}
            Create={Edit}
            type="stat.spec"
        />
        <Route
            path=":_id"
            component={TAView}
            Item={Item}
            type="stat.spec"
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
                humanTypeName="statistics specification"
            />
            <Route
                path="tags"
                component={TAView}
                Action={TAEditTags}
                type="stat.spec"
            />
            <Route
                path=":_id_stat"
                component={TAView}
                Item={StatItem}
                type="stat.stat"
            >
                <Route
                    path="remove"
                    component={TARemove}
                    Remove={Remove}
                    humanTypeName="statistics"
                />
                <Route
                    path="explore"
                    component={TAView}
                    Action={StatDataExplore}
                />
            </Route>
        </Route>
    </Route>,
    <Route
        key="charts"
        path="charts"
        component={TAView}
        List={List}
        type="stat.chart"
        ListItemComponent={ChartListItem}
        label="Charts"
        icon="timeline"
    >
        <Route
            path=":_id_chart"
            component={TAView}
            Item={ChartItem}
            type="stat.chart"
        >
            <Route
                path="remove"
                component={TARemove}
                Remove={Remove}
                humanTypeName="chart"
            />
            <Route
                path="tags"
                component={TAView}
                Action={TAEditTags}
                type="stat.chart"
            />
        </Route>
    </Route>
];

export default routes;
