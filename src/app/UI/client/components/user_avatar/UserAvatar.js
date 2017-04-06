
import React from "react";
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
    theme: React.PropTypes.object,
    className: React.PropTypes.string,
    userId: React.PropTypes.any,
    defaultUrl: React.PropTypes.string,
    large: React.PropTypes.bool
};

export default UserAvatar;
