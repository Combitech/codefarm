
import React from "react";
import Component from "ui-lib/component";
import theme from "./theme.scss";

class UserAvatar extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const imgUri = `/userrepo/user/${this.props.userId}/avatar?binary=true`;

        return (
            <img
                src={imgUri}
                className={this.props.className}
            />
        );
    }
}

UserAvatar.defaultProps = {
    className: `${theme.avatar} ${theme.avatarLarge}`
};

UserAvatar.propTypes = {
    className: React.PropTypes.string,
    theme: React.PropTypes.object,
    userId: React.PropTypes.string.isRequired,
    meta: React.PropTypes.object
};

export default UserAvatar;
