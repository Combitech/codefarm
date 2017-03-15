import React from "react";
import LightComponent from "ui-lib/light_component";
import { Input } from "react-toolbox/lib/input";
import {
    Form as TAForm
} from "ui-components/type_admin";
import { signin } from "ui-lib/auth";

class SignInForm extends LightComponent {
    constructor(props) {
        super(props);
        this.state = {
            emailOrId: "",
            password: ""
        };
    }

    async onCancel() {
        this.context.router.goBack();
    }

    async onConfirm() {
        const response = await signin(this.state.emailOrId, this.state.password);
        this.log("Sign in response", response);
        if (response.success) {
            this.context.router.push({
                pathname: "/"
            });
        }
    }

    render() {
        this.log("render", this.props);

        return (
            <TAForm
                confirmAllowed={true}
                confirmText="Sign in"
                primaryText="CodeFarm - Sign In"
                onConfirm={() => this.onConfirm()}
                onCancel={() => this.onCancel()}
            >
                <Input
                    type="text"
                    label="User id or email"
                    required={true}
                    value={this.state.emailOrId}
                    onChange={(emailOrId) => this.setState({ emailOrId })}
                />
                <Input
                    type="password"
                    label="Password"
                    required={true}
                    value={this.state.password}
                    onChange={(password) => this.setState({ password })}
                />
            </TAForm>
        );
    }
}

SignInForm.propTypes = {
    theme: React.PropTypes.object
};

SignInForm.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default SignInForm;
