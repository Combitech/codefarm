
import React from "react";
import AvatarBase, { AVATAR_TYPE } from "./AvatarBase";

class TeamAvatar extends React.PureComponent {
    render() {
        return (
            <AvatarBase
                {...this.props}
                identifier={this.props.teamId}
            />
        );
    }
}


TeamAvatar.defaultProps = {
    defaultUrl: "/Cheser/48x48/apps/system-users.png",
    className: "",
    teamId: false,
    large: false,
    avatarType: AVATAR_TYPE.TEAM
};

TeamAvatar.propTypes = {
    theme: React.PropTypes.object,
    className: React.PropTypes.string,
    teamId: React.PropTypes.any,
    defaultUrl: React.PropTypes.string,
    large: React.PropTypes.bool
};

export default TeamAvatar;
