
/* global Image */

import React from "react";
import LightComponent from "ui-lib/light_component";
import Avatar from "react-toolbox/lib/avatar";

const AVATAR_TYPE = {
    USER: "user",
    TEAM: "team"
};

const values = (a) => Object.keys(a).map((key) => a[key]);

class AvatarBase extends LightComponent {
    constructor(props) {
        super(props);

        this.image = new Image();

        this.image.onload = () => {
            this.setState({
                loaded: true
            });
        };

        if (this.props.identifier) {
            switch (this.props.avatarType) {
            case AVATAR_TYPE.USER:
                this.image.src = `/userrepo/useravatar/${this.props.identifier}/avatar`;
                break;
            case AVATAR_TYPE.TEAM:
                this.image.src = `/userrepo/teamavatar/${this.props.identifier}/avatar`;
                break;
            default:
                throw new Error(`Unkown avatar type: ${this.props.avatarType}`);
            }
        }

        this.state = {
            loaded: false
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.identifier) {
            switch (nextProps.avatarType) {
            case AVATAR_TYPE.USER:
                this.image.src = `/userrepo/useravatar/${nextProps.identifier}/avatar`;
                break;
            case AVATAR_TYPE.TEAM:
                this.image.src = `/userrepo/teamavatar/${nextProps.identifier}/avatar`;
                break;
            default:
                throw new Error(`Unkown avatar type: ${nextProps.avatarType}`);
            }
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

AvatarBase.defaultProps = {
    identifier: false,
    avatarType: AVATAR_TYPE.USER
};

AvatarBase.propTypes = {
    className: React.PropTypes.string,
    identifier: React.PropTypes.any,
    defaultUrl: React.PropTypes.string.isRequired,
    avatarType: React.PropTypes.oneOf(values(AVATAR_TYPE)).isRequired
};

export default AvatarBase;
export { AVATAR_TYPE };
