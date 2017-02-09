
import React from "react";
import Component from "ui-lib/component";
import {
    Section as TASection,
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";
import Avatar from "react-toolbox/lib/avatar";
import UserAvatar from "./UserAvatar";
import { StatusIcon } from "ui-components/status";

class Revisions extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <tbody className={this.props.theme.list}>
                {this.props.list.slice(0).reverse().map((revision) => {
                    const latestPatch = revision.patches[revision.patches.length - 1];

                    return (
                        <tr
                            key={revision._id}
                            onClick={() => this.props.onSelect(revision)}
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
                            {this.props.steps.map((step) => {
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
                })}
            </tbody>
        );
    }
}

Revisions.propTypes = {
    list: React.PropTypes.array.isRequired,
    steps: React.PropTypes.array.isRequired,
    onSelect: React.PropTypes.func,
    theme: React.PropTypes.object
};

class Header extends React.PureComponent {
    render() {
        return (
            <tbody className={this.props.theme.header}>
                <tr>
                    <td className={this.props.theme.headerRev}>Rev</td>
                    <td className={this.props.theme.headerTime}>Time</td>
                    <td className={this.props.theme.headerAuthor}>Author</td>
                    <td className={this.props.theme.headerComment}>Comment</td>
                    {this.props.steps.map((step) => {
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
    steps: React.PropTypes.array.isRequired,
    theme: React.PropTypes.object
};

class List extends Component {
    constructor(props) {
        super(props);

        this.addTypeListStateVariable("submitted", () => "coderepo.revision", (props) => {
            return {
                repository: props.item._id,
                status: "submitted"
            };
        }, true);

        this.addTypeListStateVariable("merged", () => "coderepo.revision", (props) => {
            return {
                repository: props.item._id,
                status: "merged"
            };
        }, true);

        this.addTypeListStateVariable("steps", "flowctrl.step", (/* props */) => {
            return {
                flow: "Flow1", // TODO
                visible: true
            };
        }, false);
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

        let loadIndicator;
        if (this.state.loadingAsync.value) {
            loadIndicator = (
                <TALoadIndicator />
            );
        }

        const controls = this.props.controls.slice(0);

        const Title = (props) => (
            <tbody className={this.props.theme.title}>
                <tr>
                    <td colSpan={4 + this.state.steps.length}>
                        <h5>{props.label}</h5>
                    </td>
                </tr>
            </tbody>
        );

        return (
            <div>
                {loadIndicator}
                <TASection
                    controls={controls}
                    breadcrumbs={this.props.breadcrumbs}
                >
                    <div className={this.props.theme.container}>
                        <div>
                            <table className={this.props.theme.revisionList}>
                                <Title label="Submitted" />
                                <Header
                                    steps={this.state.steps}
                                    theme={this.props.theme}
                                />
                                <Revisions
                                    list={this.state.submitted}
                                    steps={this.state.steps}
                                    onSelect={(revision) => this.onSelect(revision)}
                                    theme={this.props.theme}
                                />

                                <Title label="Merged" />
                                <Header
                                    steps={this.state.steps}
                                    theme={this.props.theme}
                                />
                                <Revisions
                                    list={this.state.merged}
                                    steps={this.state.steps}
                                    onSelect={(revision) => this.onSelect(revision)}
                                    theme={this.props.theme}
                                />
                            </table>
                        </div>
                    </div>

                </TASection>
            </div>
        );
    }
}

List.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

List.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default List;
