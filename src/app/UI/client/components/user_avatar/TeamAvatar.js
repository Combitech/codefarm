
import React from "react";
import PropTypes from "prop-types";
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
    theme: PropTypes.object,
    className: PropTypes.string,
    teamId: PropTypes.any,
    defaultUrl: PropTypes.string,
    large: PropTypes.bool
};

export default TeamAvatar;
