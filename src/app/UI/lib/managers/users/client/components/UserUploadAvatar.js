/* global FileReader document */
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

class UserUploadAvatar extends LightComponent {
    constructor(props) {
        super(props);
        this.state = {
            avatarFilename: "",
            avatarPreviewData: false
        };
    }

    async _onConfirm() {
        // TODO: Submit form using jquery or something else...
        document.getElementById("upload_avatar_form").submit();
    }

    async _onCancel() {
        this.context.router.goBack();
    }

    _confirmAllowed() {
        const user = this._getUser();
        const inputsValid = this.state.avatarFilename.length > 0;

        return user && inputsValid;
    }

    _getUser(props = null) {
        props = props || this.props;

        return props.parentItems.find((item) => item.type === "userrepo.user");
    }

    _onAvatarFilenameChange(avatarFilename, event) {
        this.setState({ avatarFilename });
        const reader = new FileReader();
        reader.onload = (e) =>
            this.setState({ avatarPreviewData: e.target.result });
        reader.readAsDataURL(event.target.files[0]);
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
                            <form
                                id="upload_avatar_form"
                                name="upload_avatar"
                                encType="multipart/form-data"
                                method="POST"
                                action={`/userrepo/useravatar/${user._id}/upload`}
                            >
                                <Input
                                    type="file"
                                    label="Choose avatar image"
                                    name="avatarFile"
                                    value={this.state.avatarFilename}
                                    onChange={(value, event) => this._onAvatarFilenameChange(value, event)}
                                    floating={false}
                                    required={true}
                                />
                            </form>
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
