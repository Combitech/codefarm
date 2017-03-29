/* global FileReader FormData XMLHttpRequest */
import React from "react";
import ImmutablePropTypes from "react-immutable-proptypes";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import {
    Form as TAForm,
    Section as TASection
} from "ui-components/type_admin";
import { Header } from "ui-components/layout";
import { isTokenValidForAccess } from "auth/lib/util";
import Notification from "ui-observables/notification";

class UserUploadAvatar extends LightComponent {
    constructor(props) {
        super(props);
        this.state = {
            avatarFilename: "",
            avatarFile: false,
            avatarPreviewData: false
        };
    }

    async _onConfirm() {
        const user = this._getUser();

        // Prepare form data
        const formData = new FormData();
        formData.append("avatar", this.state.avatarFile);

        // Prepare AJAX request
        const request = new XMLHttpRequest();
        request.addEventListener("load", () => {
            if (request.status === 200) {
                Notification.instance.publish("Avatar uploaded!");
            } else {
                Notification.instance.publish(`Avatar upload failed with status ${request.status}!`, "warning");
            }
        });
        request.addEventListener("error", () => {
            Notification.instance.publish(`Avatar upload failed with status ${request.status}!`, "warning");
        });
        request.addEventListener("abort", () => {
            Notification.instance.publish("Avatar upload aborted!", "warning");
        });
        request.open("POST", `/userrepo/useravatar/${user._id}/upload`);

        // Submit AJAX request
        request.send(formData);
    }

    async _onCancel() {
        this.context.router.goBack();
    }

    _confirmAllowed() {
        const user = this._getUser();
        const inputsValid = this.state.avatarFilename.length > 0 &&
            !!this.state.avatarFile;

        return user && inputsValid;
    }

    _getUser(props = null) {
        props = props || this.props;

        return props.parentItems.find((item) => item.type === "userrepo.user");
    }

    _onAvatarFilenameChange(avatarFilename, event) {
        const avatarFile = event.target.files[0];
        this.setState({
            avatarFilename,
            avatarFile
        });
        const reader = new FileReader();
        reader.onload = (e) =>
            this.setState({ avatarPreviewData: e.target.result });
        reader.readAsDataURL(avatarFile);
    }

    render() {
        this.log("render", this.props, this.state);

        const signedInUserPriv = this.props.activeUser.has("priv") && this.props.activeUser.get("priv").toJS();
        // Check that we have access to update teams
        let accessError;
        try {
            isTokenValidForAccess(signedInUserPriv, "userrepo.useravatar", "upload");
        } catch (error) {
            accessError = error.message;
        }

        const user = this._getUser();

        return (
            <TASection
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
            >
                <Choose>
                    <When condition={ accessError }>
                        <div>{accessError}</div>
                    </When>
                    <When condition={ user }>
                        <TAForm
                            confirmAllowed={this._confirmAllowed()}
                            confirmText={"Upload"}
                            primaryText={`Upload avatar for ${user.name}`}
                            onConfirm={() => this._onConfirm()}
                            onCancel={() => this._onCancel()}
                        >
                            <div>
                                Note that page needs to be reloaded
                                for changes to take effect.
                            </div>
                            <Input
                                type="file"
                                label="Choose avatar image"
                                name="avatarFile"
                                value={this.state.avatarFilename}
                                onChange={(value, event) => this._onAvatarFilenameChange(value, event)}
                                floating={false}
                                required={true}
                            />
                            <If condition={this.state.avatarPreviewData}>
                                <Header label="Preview" />
                                <img
                                    className={this.props.theme.uploadAvatarPreview}
                                    src={this.state.avatarPreviewData}
                                />
                            </If>
                        </TAForm>
                    </When>
                </Choose>
            </TASection>
        );
    }
}

UserUploadAvatar.propTypes = {
    theme: React.PropTypes.object,
    parentItems: React.PropTypes.array.isRequired,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired,
    activeUser: ImmutablePropTypes.map.isRequired
};

UserUploadAvatar.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default UserUploadAvatar;
