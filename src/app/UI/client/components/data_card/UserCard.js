
import React from "react";
import LightComponent from "ui-lib/light_component";
import DateTime from "ui-components/datetime";
import Tags from "ui-components/tags";
import DataCard from "./DataCard";
import UserAvatar from "ui-components/user_avatar";
import { CardTitle } from "react-toolbox/lib/card";
import stateVar from "ui-lib/state_var";
import * as pathBuilder from "ui-lib/path_builder";

class UserCard extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded)
        };
    }

    render() {
        const aliases = Object.keys(this.props.item.aliases || {})
            .map((key) => `${key}: ${this.props.item.aliases[key]}`);

        const myItemPath = pathBuilder.fromType("userrepo.user", this.props.item);

        return (
            <DataCard
                theme={this.props.theme}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
                path={myItemPath}
            >
                <CardTitle
                    avatar={(
                        <UserAvatar
                            className={this.props.theme.avatar}
                            userId={this.props.item._id}
                            large={this.props.largeIcon}
                        />
                    )}
                    title={(
                        <span>
                            {this.props.item.name}
                            <If condition={this.props.isCurrentSignedInUser}>
                                <div className={this.props.theme.currentUserLabel}>
                                    Current user
                                </div>
                            </If>
                        </span>
                    )}
                    subtitle={this.props.item.email.join(", ")}
                />
                <If condition={this.state.expanded.value}>
                    <table className={this.props.theme.table}>
                        <tbody>
                            <tr>
                                <td>ID</td>
                                <td>
                                    <span className={this.props.theme.monospace}>
                                        {this.props.item._id}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>Name</td>
                                <td>{this.props.item.name}</td>
                            </tr>
                            <tr>
                                <td>E-mails</td>
                                <td>{this.props.item.email.join(", ")}</td>
                            </tr>
                            <tr>
                                <td>Aliases</td>
                                <td>
                                    <Tags list={aliases} />
                                </td>
                            </tr>
                            <If condition={this.props.item.telephone}>
                                <tr>
                                    <td>Phone</td>
                                    <td>{this.props.item.telephone}</td>
                                </tr>
                            </If>
                            <If condition={this.props.item.webpage}>
                                <tr>
                                    <td>Webpage</td>
                                    <td>{this.props.item.webpage}</td>
                                </tr>
                            </If>
                            <tr>
                                <td>Created&nbsp;at</td>
                                <td>
                                    <DateTime
                                        value={this.props.item.created}
                                        niceDate={true}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Updated&nbsp;at</td>
                                <td>
                                    <DateTime
                                        value={this.props.item.saved}
                                        niceDate={true}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Tags</td>
                                <td>
                                    <Tags list={this.props.item.tags} />
                                </td>
                            </tr>
                            <If condition={this.props.showAdvanced}>
                                <tr>
                                    <td>Public&nbsp;keys</td>
                                    <td>{this.props.item.numKeys} uploaded</td>
                                </tr>
                            </If>
                        </tbody>
                    </table>
                </If>
            </DataCard>
        );
    }
}

UserCard.defaultProps = {
    expanded: false,
    expandable: true,
    clickable: false,
    showAdvanced: false,
    isCurrentSignedInUser: false,
    largeIcon: false,
    titleLink: false
};

UserCard.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool,
    clickable: React.PropTypes.bool,
    showAdvanced: React.PropTypes.bool,
    isCurrentSignedInUser: React.PropTypes.bool,
    largeIcon: React.PropTypes.bool,
    titleLink: React.PropTypes.bool
};

export default UserCard;
