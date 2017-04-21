
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import {
    Form as TAForm,
    Section as TASection
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
            <div className={this.props.theme.content}>
                <TASection>
                    <TAForm
                        confirmAllowed={true}
                        confirmText="Sign Out"
                        primaryText="Sign Out"
                        onConfirm={() => this.onConfirm()}
                        onCancel={() => this.onCancel()}
                    >
                        <div>
                            User {userDisplayName} currently signed in.
                        </div>
                    </TAForm>
                </TASection>
            </div>
        );
    }
}

SignOutForm.propTypes = {
    theme: PropTypes.object,
    userId: PropTypes.string,
    userName: PropTypes.string
};

SignOutForm.contextTypes = {
    router: PropTypes.object.isRequired
};

export default SignOutForm;
