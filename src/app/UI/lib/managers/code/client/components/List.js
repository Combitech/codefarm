
import React from "react";
import Component from "ui-lib/component";
import {
    Section as TASection,
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";
import Avatar from "react-toolbox/lib/avatar";
import UserAvatar from "./UserAvatar";
import { StatusIcon } from "ui-components/status";
import moment from "moment";

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

        this.addTypeListStateVariable("steps", "flowctrl.step", (props) => {
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

        if (this.state.loadingAsync.value) {
            return (
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

        const Header = () => (
            <tbody className={this.props.theme.header}>
                <tr>
                    <td className={this.props.theme.headerRev}>Rev</td>
                    <td className={this.props.theme.headerTime}>Time</td>
                    <td className={this.props.theme.headerAuthor}>Author</td>
                    <td className={this.props.theme.headerComment}>Comment</td>
                    {this.state.steps.map((step) => {
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

        const Revisions = (props) => (
            <tbody className={this.props.theme.list}>
                {props.list.slice(0).reverse().map((revision) => {
                    const latestPatch = revision.patches[revision.patches.length - 1];

                    return (
                        <tr
                            key={revision._id}
                            onClick={() => this.onSelect(revision)}
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
                            {this.state.steps.map((step) => {
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

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
            >

                <div className={this.props.theme.container}>
                    <div>
                        <table className={this.props.theme.revisionList}>
                            <Title label="Submitted" />
                            <Header />
                            <Revisions list={this.state.submitted} />

                            <Title label="Merged" />
                            <Header />
                            <Revisions list={this.state.merged} />
                        </table>
                    </div>
                </div>

            </TASection>
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
