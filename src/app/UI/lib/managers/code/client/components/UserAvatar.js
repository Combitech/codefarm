
import React from "react";
import LightComponent from "ui-lib/light_component";
import CollaboratorAvatar from "ui-components/collaborator_avatar";
import FontIcon from "react-toolbox/lib/font_icon";
import UserItem from "ui-observables/user_item";

class UserAvatar extends LightComponent {
    constructor(props) {
        super(props);

        this.user = new UserItem({
            email: props.email
        });

        this.state = {
            user: this.user.value.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.user.start());

        this.addDisposable(this.user.value.subscribe((user) => this.setState({ user })));
    }

    componentWillReceiveProps(nextProps) {
        this.user.setOpts({
            email: nextProps.email
        });
    }

    render() {
        this.log("state", JSON.stringify(this.state, null, 2));

        const noAvatarElement = <FontIcon value={this.props.noAvatarIconName} />;

        if (this.state.user.toJS()._id) {
            return (
                <CollaboratorAvatar
                    id={this.state.user.toJS()._id}
                    avatarType={"useravatar"}
                    className={this.props.className}
                    failureElement={noAvatarElement}
                />
            );
        }

        // Use default icon if no icon is specified or if avatar is loading
        return noAvatarElement;
    }
}


UserAvatar.propTypes = {
    className: React.PropTypes.string,
    email: React.PropTypes.string.isRequired,
    noAvatarIconName: React.PropTypes.string.isRequired
};

export default UserAvatar;
