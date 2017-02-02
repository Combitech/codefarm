
import React from "react";
import Component from "ui-lib/component";
import {
    Section as TASection,
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";
import Avatar from "react-toolbox/lib/avatar";
import UserAvatar from "./UserAvatar";
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

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
            >

                <div className={this.props.theme.container}>
                    <div>
                        <table className={this.props.theme.revisionList}>
                            <tbody className={this.props.theme.submittedTitle}>
                                <tr>
                                    <td colSpan={4}>
                                        <h5>Submitted</h5>
                                    </td>
                                </tr>
                            </tbody>
                            <tbody className={this.props.theme.submittedHeader}>
                                <tr>
                                    <td>SHA1</td>
                                    <td>Time</td>
                                    <td>Author</td>
                                    <td>Comment</td>
                                </tr>
                            </tbody>
                            <tbody className={this.props.theme.submittedList}>
                                {this.state.submitted.slice(0).reverse().map((revision) => {
                                    const latestPatch = revision.patches[revision.patches.length - 1];

                                    return (
                                        <tr onClick={() => this.onSelect(revision)}>
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
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tbody className={this.props.theme.mergedTitle}>
                                <tr>
                                    <td colSpan={4}>
                                        <h5>Merged</h5>
                                    </td>
                                </tr>
                            </tbody>
                            <tbody className={this.props.theme.mergedHeader}>
                                <tr>
                                    <td className={this.props.theme.headerSha1}>SHA1</td>
                                    <td className={this.props.theme.headerTime}>Time</td>
                                    <td className={this.props.theme.headerAuthor}>Author</td>
                                    <td className={this.props.theme.headerComment}>Comment</td>
                                </tr>
                            </tbody>
                            <tbody className={this.props.theme.mergedList}>
                                {this.state.merged.slice(0).reverse().map((revision) => {
                                    const latestPatch = revision.patches[revision.patches.length - 1];

                                    return (
                                        <tr onClick={() => this.onSelect(revision)}>
                                            <td className={this.props.theme.monospace}>
                                                {latestPatch.change.newrev.substr(0, 7)}
                                            </td>
                                            <td>
                                                {moment(latestPatch.submitted).local().format("YYYY-MM-DD HH:mm:ss")}
                                            </td>
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
                                        </tr>
                                    );
                                })}
                            </tbody>
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
