
import React from "react";
import Component from "ui-lib/component";
import Input from "react-toolbox/lib/input";
import {
    Section as TASection,
    LoadIndicator as TALoadIndicator,
    PagedList as TAPagedList
} from "ui-components/type_admin";
import Avatar from "react-toolbox/lib/avatar";
import { Tab, Tabs } from "react-toolbox/lib/tabs";
import UserAvatar from "./UserAvatar";
import { StatusIcon } from "ui-components/status";
import theme from "./theme.scss";

class Header extends React.PureComponent {
    render() {
        return (
            <tbody className={this.props.theme.header}>
                <tr>
                    <td className={this.props.theme.headerRev}>Rev</td>
                    <td className={this.props.theme.headerTime}>Time</td>
                    <td className={this.props.theme.headerAuthor}>Author</td>
                    <td className={this.props.theme.headerComment}>Comment</td>
                    {this.props.steps && this.props.steps.map((step) => {
                        const ucname = step.name.replace(/[a-z]/g, "");

                        return (
                            <td
                                key={step.name}
                                className={this.props.theme.runColumn}
                                title={step.name}
                            >
                                {ucname}
                            </td>
                        );
                    })}
                </tr>
            </tbody>
        );
    }
}

Header.propTypes = {
    steps: React.PropTypes.array,
    theme: React.PropTypes.object
};

class RevisionListComponent extends React.PureComponent {
    render() {
        return (
            <table className={this.props.theme.revisionList}>
                <Header
                    theme={this.props.theme}
                    steps={this.props.listContext}
                />
                <tbody className={this.props.theme.list}>
                    {this.props.children}
                </tbody>
            </table>
        );
    }
}

RevisionListComponent.propTypes = {
    theme: React.PropTypes.object,
    children: React.PropTypes.node,
    listContext: React.PropTypes.any
};

class RevisionListItemComponent extends React.PureComponent {
    render() {
        const revision = this.props.item;
        const latestPatch = revision.patches[revision.patches.length - 1];

        return (
            <tr
                key={revision._id}
                onClick={() => this.props.onClick(revision)}
            >
                <td className={this.props.theme.monospace}>
                    {latestPatch.change.newrev.substr(0, 7)}
                </td>
                <td>{latestPatch.submitted}</td>
                <td>
                    <Avatar className={this.props.theme.avatar}>
                        <UserAvatar
                            email={latestPatch.email}
                            noAvatarIconName="person"
                        />
                    </Avatar>
                    {latestPatch.name}
                </td>
                <td>{latestPatch.comment.split("\n", 1)[0]}</td>
                {this.props.itemContext.map((step) => {
                    // TODO: Clean this up!
                    let status = "unknown";

                    if (revision.tags.includes(`step:${step.name}:success`)) {
                        status = "success";
                    } else if (revision.tags.includes(`step:${step.name}:fail`)) {
                        status = "fail";
                    } else if (revision.tags.includes(`step:${step.name}:skip`)) {
                        status = "skip";
                    } else if (revision.tags.includes(`step:${step.name}:aborted`)) {
                        status = "aborted";
                    } else if (revision.refs.find((ref) => ref.name === step.name)) {
                        status = "ongoing";
                    }

                    return (
                        <td
                            className={this.props.theme.runColumn}
                            key={step.name}
                        >
                            <StatusIcon
                                className={this.props.theme.statusIcon}
                                status={status}
                                size={24}
                            />
                        </td>
                    );
                })}
            </tr>
        );
    }
}

RevisionListItemComponent.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    itemContext: React.PropTypes.any,
    onClick: React.PropTypes.func
};

class RevisionList extends Component {
    constructor(props) {
        super(props);

        this.addTypeListStateVariable("steps", "flowctrl.step", (/* props */) => ({
            "flow.id": "Flow1", // TODO
            visible: true
        }), false);
    }

    onSelect(item) {
        this.context.router.push({
            pathname: `${this.props.pathname}/${item._id}`
        });
    }

    render() {
        this.log("render", this.props, this.state);

        if (this.state.errorAsync.value) {
            return (
                <div>{this.state.errorAsync.value}</div>
            );
        }

        if (this.state.loadingAsync.value) {
            return (
                <TALoadIndicator />
            );
        }

        return (
            <TAPagedList
                theme={this.props.theme}
                type={"coderepo.revision"}
                ListComponent={RevisionListComponent}
                listContext={this.state.steps}
                ListItemComponent={RevisionListItemComponent}
                listItemContext={this.state.steps}
                filter={this.props.filter}
                filterFields={[ "name", "tags", "_id", "patches.email", "patches.name", "patches.comment", "patches.change.newrev" ]}
                query={this.props.query}
                pageSize={10}
                onSelect={(item) => {
                    this.context.router.push({
                        pathname: `${this.props.pathname}/${item._id}`
                    });
                }}
                route={this.props.route}
                relative={this.props.relative}
            />
        );
    }
}

RevisionList.propTypes = {
    theme: React.PropTypes.object,
    query: React.PropTypes.object,
    filter: React.PropTypes.string,
    pathname: React.PropTypes.string.isRequired,
    route: React.PropTypes.object.isRequired,
    relative: React.PropTypes.object.isRequired
};

RevisionList.contextTypes = {
    router: React.PropTypes.object.isRequired
};

class RevisionTabs extends Component {
    constructor(props) {
        super(props);

        this.addStateVariable("tabIndex", "0", true);
        this.addStateVariable("filter", "");
        this.addStateVariable("mergedRel", "__HEAD__", true);
        this.addStateVariable("submittedRel", "__HEAD__", true);
    }

    render() {
        this.log("render", this.props, this.state);

        if (this.state.errorAsync.value) {
            return (
                <div>{this.state.errorAsync.value}</div>
            );
        }

        if (this.state.loadingAsync.value) {
            return (
                <TALoadIndicator/>
            );
        }

        const controls = this.props.controls.slice(0);

        controls.push((
            <Input
                key="filter"
                className={this.props.theme.filterInput}
                type="text"
                label="Filter list"
                name="filter"
                value={this.state.filter.value}
                onChange={this.state.filter.set}
            />
        ));

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <div className={this.props.theme.container}>
                    {this.props.item &&
                        <Tabs
                            index={parseInt(this.state.tabIndex.value, 10)}
                            onChange={(index) => this.state.tabIndex.set(`${index}`)}
                            fixed={false}
                        >
                            <Tab label="Submitted">
                                <RevisionList
                                    theme={theme}
                                    query={{
                                        repository: this.props.item._id,
                                        status: "submitted"
                                    }}
                                    filter={this.state.filter.value}
                                    pathname={this.props.pathname}
                                    route={this.props.route}
                                    relative={this.state.submittedRel}
                                />
                            </Tab>
                            <Tab label="Merged">
                                <RevisionList
                                    theme={theme}
                                    query={{
                                        repository: this.props.item._id,
                                        status: "merged"
                                    }}
                                    filter={this.state.filter.value}
                                    pathname={this.props.pathname}
                                    route={this.props.route}
                                    relative={this.state.mergedRel}
                                />
                            </Tab>
                        </Tabs>
                    }
                </div>
            </TASection>
        );
    }
}

RevisionTabs.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired,
    route: React.PropTypes.object.isRequired
};

RevisionTabs.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default RevisionTabs;
