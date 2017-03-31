
import React from "react";
import LightComponent from "ui-lib/light_component";
import DateTime from "ui-components/datetime";
import Tags from "ui-components/tags";
import DataCard from "./DataCard";
import { TeamAvatar } from "ui-components/user_avatar";
import { CardTitle } from "react-toolbox/lib/card";
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
        const myItemPath = pathBuilder.fromType("userrepo.team", this.props.item);

        return (
            <DataCard
                them={this.props.theme}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
                path={myItemPath}
            >
                <CardTitle
                    avatar={(
                        <TeamAvatar
                            className={this.props.theme.avatar}
                            teamId={this.props.item._id}
                        />
                    )}
                    title={this.props.item.name}
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
            </DataCard>
        );
    }
}

TeamCard.defaultProps = {
    expanded: false,
    expandable: true,
    clickable: false
};

TeamCard.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool,
    clickable: React.PropTypes.bool
};

TeamCard.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default TeamCard;
