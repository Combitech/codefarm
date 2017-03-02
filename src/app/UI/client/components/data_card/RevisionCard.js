
import React from "react";
import LightComponent from "ui-lib/light_component";
import { CardTitle, CardText } from "react-toolbox/lib/card";
import Avatar from "react-toolbox/lib/avatar";
import DateTime from "ui-components/datetime";
import Chip from "react-toolbox/lib/chip";
import ExpandableCard from "ui-components/expandable_card";
import stateVar from "ui-lib/state_var";
import UserItem from "ui-observables/user_item";

class RevisionCard extends LightComponent {
    constructor(props) {
        super(props);

        this.user = new UserItem({
            email: this.getLatestPatch(props).email
        });

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded),
            user: this.user.value.getValue()
        };
    }

    getLatestPatch(props) {
        return props.revision.patches[props.revision.patches.length - 1];
    }

    componentDidMount() {
        this.addDisposable(this.user.start());

        this.addDisposable(this.user.value.subscribe((user) => this.setState({ user })));
    }

    componentWillReceiveProps(nextProps) {
        this.user.setOpts({
            email: this.getLatestPatch(nextProps).email
        });
    }

    render() {
        const patch = this.getLatestPatch(this.props);
        const user = this.state.user.toJS()._id ? this.state.user.toJS() : null;

        return (
            <ExpandableCard
                expanded={this.state.expanded}
                expandable={this.props.expandable}
            >
                <CardTitle
                    avatar={user && (
                        <Avatar image={`/userrepo/useravatar/${user._id}/avatar`} />
                    )}
                    title={`${user ? user.name : patch.name} <${user ? user.email : patch.email}>`}
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
                                    {this.props.revision.status}
                                </td>
                            </tr>
                            <tr>
                                <td>Repository</td>
                                <td>
                                    {this.props.revision.repository}
                                </td>
                            </tr>
                            <tr>
                                <td>Patches</td>
                                <td>
                                    {this.props.revision.patches.length}
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
                                    {this.props.revision.tags.map((tag) => (
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
    expandable: true
};

RevisionCard.propTypes = {
    theme: React.PropTypes.object,
    revision: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool
};

export default RevisionCard;
