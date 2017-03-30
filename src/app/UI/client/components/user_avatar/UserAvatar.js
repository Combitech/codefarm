
import React from "react";
import LightComponent from "ui-lib/light_component";
import AvatarBase, { AVATAR_TYPE } from "./AvatarBase";

class UserAvatar extends LightComponent {
    render() {
        this.log("state", JSON.stringify(this.state, null, 2));

        return (
            <AvatarBase
                className={this.props.className}
                theme={this.props.theme}
                identifier={this.props.userId}
                avatarType={AVATAR_TYPE.USER}
                defaultUrl={this.props.defaultUrl}
                large={this.props.large}
            />
        );
    }
}

UserAvatar.defaultProps = {
    defaultUrl: "/Cheser/48x48/status/avatar-default.png",
    userId: false,
    large: false
};

UserAvatar.propTypes = {
    className: React.PropTypes.string,
    userId: React.PropTypes.any,
    defaultUrl: React.PropTypes.string,
    large: React.PropTypes.bool
};

export default UserAvatar;
