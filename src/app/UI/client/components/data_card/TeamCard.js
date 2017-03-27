
import React from "react";
import LightComponent from "ui-lib/light_component";
import { CardTitle } from "react-toolbox/lib/card";
import { IconButton } from "react-toolbox/lib/button";
import DateTime from "ui-components/datetime";
import Tags from "ui-components/tags";
import ExpandableCard from "ui-components/expandable_card";
import { TeamAvatar } from "ui-components/user_avatar";
import stateVar from "ui-lib/state_var";
import * as pathBuilder from "ui-lib/path_builder";

class TeamCard extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded)
        };
    }

    render() {
        // Instantiate link button if not already on link destination
        const myItemPath = pathBuilder.fromType("userrepo.team", this.props.item);
        let openItemLinkButton;
        if (!this.context.router.isActive(myItemPath)) {
            openItemLinkButton = (
                <IconButton
                    icon="open_in_browser"
                    onClick={() => {
                        this.context.router.push({
                            pathname: myItemPath
                        });
                    }}
                />
            );
        }

        return (
            <ExpandableCard
                className={this.props.theme.card}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
            >
                <CardTitle
                    avatar={(
                        <TeamAvatar
                            className={this.props.theme.avatar}
                            teamId={this.props.item._id}
                        />
                    )}
                    title={(
                        <div>
                            {this.props.item.name}
                            {openItemLinkButton}
                        </div>
                    )}
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
                                <td>Email</td>
                                <td>{this.props.item.email}</td>
                            </tr>
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
                        </tbody>
                    </table>
                </If>
            </ExpandableCard>
        );
    }
}

TeamCard.defaultProps = {
    expanded: false,
    expandable: true
};

TeamCard.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool
};

TeamCard.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default TeamCard;
