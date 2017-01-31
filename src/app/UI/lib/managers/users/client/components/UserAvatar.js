
import React from "react";
import Component from "ui-lib/component";
import DynamicImage from "ui-components/dynamic_image";
import api from "api.io/api.io-client";
import theme from "./theme.scss";

class UserAvatar extends Component {
    constructor(props) {
        super(props);
        this.addStateVariable("imageData", null);
    }

    async _load() {
        // No need to load unless we have a mimeType
        if (this.props.meta && this.props.meta.mimeType) {
            const data = await api.type.getter("userrepo.user", this.props.userId, "avatar");
            this.state.imageData.set(data);
        }
    }

    async componentWillReceivePropsAsync(nextProps) {
        if (this.props.userId !== nextProps.userId ||
            JSON.stringify(this.props.meta) !== JSON.stringify(nextProps.meta)) {
            await this._load();
        }
    }

    async componentDidMountAsync() {
        await this._load();
    }

    render() {
        let avatar = null;
        if (this.state.imageData.value) {
            avatar = (
                <DynamicImage
                    className={this.props.className}
                    base64={this.state.imageData.value}
                    mimeType={this.props.meta.mimeType}
                />
            );
        }

        return avatar;
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
