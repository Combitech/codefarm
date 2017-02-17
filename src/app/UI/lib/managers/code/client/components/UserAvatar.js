
import React from "react";
import Component from "ui-lib/component";
import CollaboratorAvatar from "ui-components/collaborator_avatar";
import FontIcon from "react-toolbox/lib/font_icon";

class UserAvatar extends Component {
    constructor(props) {
        super(props);
        this.addTypeListStateVariable("user", "userrepo.user", (props) => ({
            "email": props.email
        }), false);
    }

    render() {
        let avatar = null;
        const noAvatarElement = <FontIcon value={this.props.noAvatarIconName} />;

        if (this.state.user) {
            if (this.state.user.length === 1) {
                const user = this.state.user[0];
                if (user) {
                    avatar = (
                        <CollaboratorAvatar
                            id={user._id}
                            avatarType={"useravatar"}
                            className={this.props.className}
                            failureElement={noAvatarElement}
                        />
                    );
                }
            } else if (this.state.user.length > 1) {
                console.log(`Found multiple users with email ${this.props.email}`, this.state.user);
            }
        }

        // Use default icon if no icon is specified or if avatar is loading
        if (!avatar) {
            avatar = noAvatarElement;
        }

        return avatar;
    }
}


UserAvatar.propTypes = {
    className: React.PropTypes.string,
    email: React.PropTypes.string.isRequired,
    noAvatarIconName: React.PropTypes.string.isRequired
};

export default UserAvatar;
