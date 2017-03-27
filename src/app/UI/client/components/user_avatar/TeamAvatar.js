
import React from "react";
import LightComponent from "ui-lib/light_component";
import AvatarBase, { AVATAR_TYPE } from "./AvatarBase";

class TeamAvatar extends LightComponent {
    render() {
        this.log("state", JSON.stringify(this.state, null, 2));

        return (
            <AvatarBase
                className={this.props.className}
                theme={this.props.theme}
                identifier={this.props.teamId}
                avatarType={AVATAR_TYPE.TEAM}
                defaultUrl={this.props.defaultUrl}
            />
        );
    }
}

TeamAvatar.defaultProps = {
    defaultUrl: "/Cheser/48x48/apps/system-users.png",
    teamId: false
};

TeamAvatar.propTypes = {
    className: React.PropTypes.string,
    teamId: React.PropTypes.any,
    defaultUrl: React.PropTypes.string
};

export default TeamAvatar;
