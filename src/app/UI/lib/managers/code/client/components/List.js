
import React from "react";
import ImmutablePropTypes from "react-immutable-proptypes";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import {
    Section as TASection,
    LoadIndicator as TALoadIndicator,
    ListPager as TAListPager
} from "ui-components/type_admin";
import UserAvatar from "ui-components/user_avatar";
import { Tab, Tabs } from "react-toolbox/lib/tabs";
import { StatusIcon } from "ui-components/status";
import theme from "./theme.scss";
import RevisionListObservable from "../observables/paged_revision_list";
import StepListObservable from "ui-observables/step_list";
import DateTime from "ui-components/datetime";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import locationQuery from "ui-observables/location_query";

class Header extends React.PureComponent {
    render() {
        return (
            <tbody className={this.props.theme.header}>
                <tr>
                    <td className={this.props.theme.headerRev}>Rev</td>
                    <td className={this.props.theme.headerTime}>Time</td>
                    <td className={this.props.theme.headerAuthor}>Author</td>
                    <td className={this.props.theme.headerComment}>Comment</td>
                    {this.props.steps && this.props.steps.toJS().map((step) => {
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
    steps: ImmutablePropTypes.list,
    theme: React.PropTypes.object
};

class RevisionListComponent extends React.PureComponent {
    render() {
        return (
            <table className={this.props.theme.revisionList}>
                <Header
                    theme={this.props.theme}
                    steps={this.props.steps}
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
    steps: ImmutablePropTypes.list
};

class RevisionListItemComponent extends React.PureComponent {
    render() {
        const revision = this.props.item.toJS();
        const latestPatch = revision.patches[revision.patches.length - 1];

        return (
            <tr
                key={revision._id}
                onClick={() => this.props.onClick(revision)}
            >
                <td className={this.props.theme.monospace}>
                    {latestPatch.change.newrev.substr(0, 7)}
                </td>
                <td>
                    <DateTime value={latestPatch.submitted} />
                </td>
                <td>
                    <UserAvatar
                        className={this.props.theme.avatar}
                        userId={latestPatch.userRef ? latestPatch.userRef.id : false}
                    />
                    {latestPatch.name}
                </td>
                <td>{latestPatch.comment.split("\n", 1)[0]}</td>
                {this.props.steps.toJS().map((step) => {
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
    item: ImmutablePropTypes.map.isRequired,
    steps: ImmutablePropTypes.list,
    onClick: React.PropTypes.func
};

class RevisionList extends LightComponent {
    constructor(props) {
        super(props);

        this.stepList = new StepListObservable({
            flowId: "Flow1", // TODO
            visible: true,
            sortOn: "created",
            sortDesc: false,
            subscribe: false
        });

        this.revList = new RevisionListObservable({
            repositoryId: this.props.repositoryId,
            status: this.props.revisionStatus,
            filter: props.filter,
            limit: 10
        });

        this.state = {
            revList: this.revList.value.getValue(),
            revListState: this.revList.state.getValue(),
            stepList: this.stepList.value.getValue(),
            stepListState: this.stepList.state.getValue()
        };
    }

    componentDidMount() {
        this.log("componentDidMount");
        this.addDisposable(this.stepList.start());
        this.addDisposable(this.stepList.value.subscribe((stepList) => this.setState({ stepList })));
        this.addDisposable(this.stepList.state.subscribe((stepListState) => this.setState({ stepListState })));

        this.addDisposable(this.revList.start());
        this.addDisposable(this.revList.value.subscribe((revList) => this.setState({ revList })));
        this.addDisposable(this.revList.state.subscribe((revListState) => this.setState({ revListState })));
    }

    componentDidUpdate() {
        this.log("componentDidUpdate");
        /* If relative paging is used and current page has no next or previous
         * page, then automatically navigate to last or first page.
         */
        const pagingInfo = this.revList.pagingInfo.getValue().toJS();
        if (pagingInfo.isRelative) {
            if (!pagingInfo.hasNextPage) {
                this.log("setLastPage");
                this.revList.setLastPage();
            } else if (!pagingInfo.hasPrevPage) {
                this.log("setFirstPage");
                this.revList.setFirstPage();
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        this.log("componentWillReceiveProps");
        if (nextProps.filter) {
            this.revList.setOpts({ filter: nextProps.filter });
        }
    }

    render() {
        this.log("render", this.props, this.state);

        let loadIndicator;
        if (this.state.state === ObservableDataStates.LOADING) {
            loadIndicator = (
                <TALoadIndicator/>
            );
        }

        return (
            <div>
                {loadIndicator}
                <RevisionListComponent
                    theme={this.props.theme}
                    steps={this.state.stepList}
                >
                    {this.state.revList.map((item) => (
                        <RevisionListItemComponent
                            key={item.get("_id")}
                            theme={this.props.theme}
                            onClick={() => {
                                this.context.router.push({
                                    pathname: `${this.props.pathname}/${item.get("_id")}`
                                });
                            }}
                            item={item}
                            steps={this.state.stepList}
                        />
                    ))}
                </RevisionListComponent>
                <TAListPager
                    pagedList={this.revList}
                    pagingInfo={this.revList.pagingInfo.getValue()}
                />
            </div>
        );
    }
}

RevisionList.propTypes = {
    theme: React.PropTypes.object,
    repositoryId: React.PropTypes.string.isRequired,
    revisionStatus: React.PropTypes.string.isRequired,
    filter: React.PropTypes.string,
    pathname: React.PropTypes.string.isRequired
};

RevisionList.contextTypes = {
    router: React.PropTypes.object.isRequired
};

class RevisionTabs extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            params: locationQuery.params.getValue(),
            filter: ""
        };
    }

    componentDidMount() {
        this.addDisposable(locationQuery.params.subscribe((params) => this.setState({ params })));
    }

    render() {
        this.log("render", this.props, this.state);

        const controls = this.props.controls.slice(0);

        controls.push((
            <Input
                key="filter"
                className={this.props.theme.filterInput}
                type="text"
                label="Filter list"
                name="filter"
                value={this.state.filter}
                onChange={(value) => this.setState({ filter: value })}
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
                            index={parseInt(this.state.params.toJS().tabIndex, 10)}
                            onChange={(tabIndex) => locationQuery.setParams({ tabIndex })}
                            fixed={true}
                        >
                            <Tab label="Submitted">
                                <RevisionList
                                    theme={theme}
                                    repositoryId={this.props.item._id}
                                    revisionStatus="submitted"
                                    filter={this.state.filter}
                                    pathname={this.props.pathname}
                                />
                            </Tab>
                            <Tab label="Merged">
                                <RevisionList
                                    theme={theme}
                                    repositoryId={this.props.item._id}
                                    revisionStatus="merged"
                                    filter={this.state.filter}
                                    pathname={this.props.pathname}
                                />
                            </Tab>
                            <Tab label="Abandoned">
                                <RevisionList
                                    theme={theme}
                                    repositoryId={this.props.item._id}
                                    revisionStatus="abandoned"
                                    filter={this.state.filter}
                                    pathname={this.props.pathname}
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
    controls: React.PropTypes.array.isRequired
};

RevisionTabs.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default RevisionTabs;
