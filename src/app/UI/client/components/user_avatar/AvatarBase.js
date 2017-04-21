
/* global Image */

import React from "react";
import PropTypes from "prop-types";
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
        this.log("render", this.props, JSON.stringify(this.state, null, 2));

        const className = `${this.props.className} ${this.props.large ? this.props.theme.avatarLarge : ""}`;

        return (
            <span
                className={`${this.props.theme.container} ${className}`}
            >
                <Choose>
                    <When condition={!this.state.loaded && !this.props.forceAvatar}>
                        <img
                            className={`${this.props.theme.avatar} ${className}`}
                            style={{ marginRight: 0 }}
                            src={this.props.defaultUrl}
                        />
                    </When>
                    <Otherwise>
                        <Avatar
                            className={`${this.props.theme.avatar} ${className}`}
                            style={{ marginRight: 0 }}
                            image={this.state.loaded ? this.image.src : this.props.defaultUrl}
                        />
                    </Otherwise>
                </Choose>
                <If condition={this.props.emblem}>
                    <img
                        className={this.props.theme.emblem}
                        src={this.props.emblem}
                    />
                </If>
            </span>
        );
    }
}

AvatarBase.defaultProps = {
    identifier: false,
    avatarType: AVATAR_TYPE.USER,
    large: false
};

AvatarBase.propTypes = {
    className: PropTypes.string,
    identifier: PropTypes.any,
    defaultUrl: PropTypes.string.isRequired,
    avatarType: PropTypes.oneOf(values(AVATAR_TYPE)).isRequired,
    forceAvatar: PropTypes.bool,
    large: PropTypes.bool
};

export default AvatarBase;
export { AVATAR_TYPE };
