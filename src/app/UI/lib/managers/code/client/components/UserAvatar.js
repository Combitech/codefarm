
import React from "react";
import Component from "ui-lib/component";
import UsersUserAvatar from "ui-mgr/users/client/components/UserAvatar";
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

        if (this.state.user) {
            if (this.state.user.length === 1) {
                const user = this.state.user[0];
                if (user) {
                    avatar = (
                        <UsersUserAvatar
                            userId={user._id}
                            meta={user.avatar.meta}
                            className={this.props.className}
                        />
                    );
                }
            } else if (this.state.user.length > 1) {
                console.log(`Found multiple users with email ${this.props.email}`, this.state.user);
            }
        }

        // Use default icon if no icon is specified or if avatar is loading
        if (!avatar) {
            avatar = <FontIcon value={this.props.noAvatarIconName} />;
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
