import React from "react";
import LightComponent from "ui-lib/light_component";
import {
    Form as TAForm
} from "ui-components/type_admin";
import { signout } from "ui-lib/auth";

class SignOutForm extends LightComponent {
    async onCancel() {
        this.context.router.goBack();
    }

    async onConfirm() {
        const response = await signout();
        this.log("Sign out response", response);
        if (response.success) {
            this.context.router.push({
                pathname: "/signin"
            });
        }
    }

    render() {
        this.log("render", this.props);

        const userDisplayName = this.props.userName || this.props.userId;

        return (
            <TAForm
                confirmAllowed={true}
                confirmText="Sign out"
                primaryText="CodeFarm - Sign Out"
                onConfirm={() => this.onConfirm()}
                onCancel={() => this.onCancel()}
            >
                <div>
                    User {userDisplayName} currently signed in.
                </div>
            </TAForm>
        );
    }
}

SignOutForm.propTypes = {
    theme: React.PropTypes.object,
    userId: React.PropTypes.string,
    userName: React.PropTypes.string
};

SignOutForm.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default SignOutForm;
