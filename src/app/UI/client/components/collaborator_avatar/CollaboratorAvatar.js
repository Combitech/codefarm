
import React from "react";
import theme from "./theme.scss";

class CollaboratorAvatar extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            avatarLoadError: false
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.id !== nextProps.id ||
            this.props.avatarType !== nextProps.avatarType) {
            this.setState({ avatarLoadError: false });
        }
    }

    render() {
        let avatar = null;
        if (this.state.avatarLoadError) {
            avatar = this.props.failureElement || null;
        } else if (this.props.id) {
            const imgUri = `/userrepo/${this.props.avatarType}/${this.props.id}/avatar?binary=true`;
            avatar = (
                <img
                    onError={() => this.setState({ avatarLoadError: true })}
                    src={imgUri}
                    className={this.props.className}
                />
            );
        }


        return avatar;
    }
}

CollaboratorAvatar.defaultProps = {
    className: `${theme.avatar}`,
    avatarType: "useravatar"
};

CollaboratorAvatar.propTypes = {
    className: React.PropTypes.string,
    theme: React.PropTypes.object,
    id: React.PropTypes.string.isRequired,
    avatarType: React.PropTypes.oneOf([ "useravatar", "teamavatar" ]),
    failureElement: React.PropTypes.element
};

export default CollaboratorAvatar;
