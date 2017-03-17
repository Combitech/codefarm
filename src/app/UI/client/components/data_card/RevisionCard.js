
import React from "react";
import LightComponent from "ui-lib/light_component";
import { CardTitle, CardText } from "react-toolbox/lib/card";
import UserAvatar from "ui-components/user_avatar";
import DateTime from "ui-components/datetime";
import Tags from "ui-components/tags";
import ExpandableCard from "ui-components/expandable_card";
import stateVar from "ui-lib/state_var";
import UserItem from "ui-observables/user_item";
import { StringUtil } from "misc";

class RevisionCard extends LightComponent {
    constructor(props) {
        super(props);

        const patch = this.getLatestPatch(props);

        this.user = new UserItem({
            identifier: patch.userRef ? patch.userRef.id : patch.email
        });

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded),
            user: this.user.value.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.user.start());
        this.addDisposable(this.user.value.subscribe((user) => this.setState({ user })));
    }

    componentWillReceiveProps(nextProps) {
        const patch = this.getLatestPatch(nextProps);

        this.user.setOpts({
            identifier: patch.userRef ? patch.userRef.id : patch.email
        });
    }

    getLatestPatch(props) {
        if (this.props.patchIndex < 0) {
            return props.item.patches[props.item.patches.length + this.props.patchIndex];
        }

        return props.item.patches[this.props.patchIndex];
    }

    render() {
        const patch = this.getLatestPatch(this.props);
        const name = this.state.user.get("name", patch.name);
        const emails = this.state.user.get("email");
        const email = emails ? emails.first() : patch.email;

        const title = () => {
            if (this.props.patchIndex < 0) {
                return `${name} <${email}>`;
            } else if (this.props.patchIndex === this.props.item.patches.length - 1 && this.props.item.status === "merged") {
                return `Merged by ${name} <${email}>`;
            }

            return `Submitted by ${name} <${email}>`;
        };

        return (
            <ExpandableCard
                className={this.props.theme.card}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
            >
                <CardTitle
                    avatar={(
                        <UserAvatar
                            className={this.props.theme.avatar}
                            userId={patch.userRef.id}
                        />
                    )}
                    title={title()}
                    subtitle={(
                        <DateTime
                            value={patch.submitted}
                            niceDate={true}
                        />
                    )}
                />
                <CardText>
                    <span className={this.props.theme.comment}>
                        {patch.comment}
                    </span>
                </CardText>
                <If condition={this.state.expanded.value}>
                    <table className={this.props.theme.table}>
                        <tbody>
                            <tr>
                                <td>Status</td>
                                <td>
                                    {StringUtil.toUpperCaseLetter(this.props.item.status)}
                                </td>
                            </tr>
                            <tr>
                                <td>Repository</td>
                                <td>
                                    {this.props.item.repository}
                                </td>
                            </tr>
                            <If condition={this.props.patchIndex < 0}>
                                <tr>
                                    <td>Patches</td>
                                    <td>
                                        {this.props.item.patches.length}
                                    </td>
                                </tr>
                            </If>
                            <If condition={this.props.patchIndex >= 0}>
                                <tr>
                                    <td>Patch</td>
                                    <td>
                                        {this.props.patchIndex + 1}
                                        <span> of </span>
                                        {this.props.item.patches.length}
                                    </td>
                                </tr>
                            </If>
                            <tr>
                                <td>Refname</td>
                                <td className={this.props.theme.monospace}>
                                    {patch.change.refname}
                                </td>
                            </tr>
                            <tr>
                                <td>SHA1</td>
                                <td className={this.props.theme.monospace}>
                                    {patch.change.newrev}
                                </td>
                            </tr>
                            <tr>
                                <td>Previous SHA1</td>
                                <td className={this.props.theme.monospace}>
                                    {patch.change.oldrev}
                                </td>
                            </tr>
                            <tr>
                                <td>Tags</td>
                                <td>
                                    <Tags list={this.props.item.tags} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </If>
            </ExpandableCard>
        );
    }
}

RevisionCard.defaultProps = {
    expanded: false,
    expandable: true,
    patchIndex: -1
};

RevisionCard.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    patchIndex: React.PropTypes.number,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool
};

export default RevisionCard;
