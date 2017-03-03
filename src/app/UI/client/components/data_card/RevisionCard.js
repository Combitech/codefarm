
import React from "react";
import LightComponent from "ui-lib/light_component";
import { CardTitle, CardText } from "react-toolbox/lib/card";
import UserAvatar from "ui-components/user_avatar";
import DateTime from "ui-components/datetime";
import Chip from "react-toolbox/lib/chip";
import ExpandableCard from "ui-components/expandable_card";
import stateVar from "ui-lib/state_var";
import { StringUtil } from "misc";

class RevisionCard extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded)
        };
    }

    getLatestPatch(props) {
        if (this.props.patchIndex < 0) {
            return props.item.patches[props.item.patches.length + this.props.patchIndex];
        }

        return props.item.patches[this.props.patchIndex];
    }

    render() {
        const patch = this.getLatestPatch(this.props);

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
                            identifier={patch.userRef ? patch.userRef.id : patch.email}
                        />
                    )}
                    title={`${patch.name} <${patch.email}>`}
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
                {this.state.expanded.value && (
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
                            <tr>
                                <td>Patches</td>
                                <td>
                                    {this.props.item.patches.length}
                                </td>
                            </tr>
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
                                    {this.props.item.tags.map((tag) => (
                                        <Chip key={tag}>{tag}</Chip>
                                    ))}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}
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
