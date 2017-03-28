
import React from "react";
import ImmutablePropTypes from "react-immutable-proptypes";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import {
    Form as TAForm,
    Section as TASection
} from "ui-components/type_admin";
import { isTokenValidForAccess } from "auth/lib/util";

class UserUploadAvatar extends LightComponent {
    constructor(props) {
        super(props);
    }

    async _onConfirm() {
    }

    async _onCancel() {
        this.context.router.goBack();
    }

    _confirmAllowed() {
        const user = this._getUser();
        const inputsValid = true;

        return user && inputsValid;
    }

    _getUser(props = null) {
        props = props || this.props;

        return props.parentItems.find((item) => item.type === "userrepo.user");
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
                            {/* TODO - prettify upload below... */}
                            <form
                                name="upload_avatar"
                                encType="multipart/form-data"
                                method="POST"
                                action={`/userrepo/useravatar/${user._id}/upload`}
                            >
                                <Input
                                    type="file"
                                    label="Choose image file"
                                    name="avatarFile"
                                />
                                <Input
                                    type="submit"
                                    value="submit"
                                />
                            </form>
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
