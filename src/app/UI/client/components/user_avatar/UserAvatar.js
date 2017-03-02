
/* global Image */

import React from "react";
import LightComponent from "ui-lib/light_component";
import Avatar from "react-toolbox/lib/avatar";
import UserItem from "ui-observables/user_item";

class UserAvatar extends LightComponent {
    constructor(props) {
        super(props);

        this.image = new Image();

        this.image.onload = () => {
            this.setState({ url: this.image.src });
        };

        this.user = new UserItem({
            identifier: props.identifier
        });

        this.state = {
            user: this.user.value.getValue(),
            url: false
        };
    }

    componentDidMount() {
        this.addDisposable(this.user.start());

        this.addDisposable(this.user.value.subscribe((user) => {
            this.setState({
                url: false,
                user: user
            });

            if (user.toJS()._id) {
                this.image.src = `/userrepo/useravatar/${user.toJS()._id}/avatar`;
            }
        }));
    }

    componentWillReceiveProps(nextProps) {
        this.user.setOpts({
            email: nextProps.identifier
        });
    }

    render() {
        this.log("state", JSON.stringify(this.state, null, 2));

        if (this.state.url && this.state.user.toJS()._id) {
            return (
                <Avatar
                    className={`${this.props.theme.avatar} ${this.props.className}`}
                    image={this.state.url}
                />
            );
        }

        return (
            <img
                className={`${this.props.theme.image} ${this.props.className}`}
                src={this.props.defaultUrl}
            />
        );
    }
}

UserAvatar.defaultProps = {
    defaultUrl: "/Cheser/48x48/status/avatar-default.png",
    identifier: false
};

UserAvatar.propTypes = {
    className: React.PropTypes.string,
    identifier: React.PropTypes.any,
    defaultUrl: React.PropTypes.string
};

export default UserAvatar;
