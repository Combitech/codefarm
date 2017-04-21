
import React from "react";
import PropTypes from "prop-types";
import AvatarBase, { AVATAR_TYPE } from "./AvatarBase";

class UserAvatar extends React.PureComponent {
    render() {
        return (
            <AvatarBase
                {...this.props}
                identifier={this.props.userId}
            />
        );
    }
}

UserAvatar.defaultProps = {
    defaultUrl: "/Cheser/48x48/status/avatar-default.png",
    className: "",
    userId: false,
    large: false,
    avatarType: AVATAR_TYPE.USER
};

UserAvatar.propTypes = {
    theme: PropTypes.object,
    className: PropTypes.string,
    userId: PropTypes.any,
    defaultUrl: PropTypes.string,
    large: PropTypes.bool
};

export default UserAvatar;
