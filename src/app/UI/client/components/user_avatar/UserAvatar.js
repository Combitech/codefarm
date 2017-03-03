
/* global Image */

import React from "react";
import LightComponent from "ui-lib/light_component";
import Avatar from "react-toolbox/lib/avatar";

class UserAvatar extends LightComponent {
    constructor(props) {
        super(props);

        this.image = new Image();

        this.image.onload = () => {
            this.setState({
                loaded: true
            });
        };

        if (this.props.userId) {
            this.image.src = `/userrepo/useravatar/${this.props.userId}/avatar`;
        }

        this.state = {
            loaded: false
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userId) {
            this.image.src = `/userrepo/useravatar/${nextProps.userId}/avatar`;
        }

        this.setState({
            loaded: false
        });
    }

    render() {
        this.log("state", JSON.stringify(this.state, null, 2));

        if (this.state.loaded) {
            return (
                <Avatar
                    className={`${this.props.theme.avatar} ${this.props.className}`}
                    image={this.image.src}
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
    userId: false
};

UserAvatar.propTypes = {
    className: React.PropTypes.string,
    userId: React.PropTypes.any,
    defaultUrl: React.PropTypes.string
};

export default UserAvatar;
