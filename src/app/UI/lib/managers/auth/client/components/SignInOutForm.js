import React from "react";
import LightComponent from "ui-lib/light_component";
import { Input } from "react-toolbox/lib/input";
import {
    Form as TAForm
} from "ui-components/type_admin";
import { signin, signout } from "ui-lib/auth";
import ActiveUser from "ui-observables/active_user";

class SignInOutForm extends LightComponent {
    constructor(props) {
        super(props);
        this.state = {
            activeUser: ActiveUser.instance.user.getValue(),
            emailOrId: "",
            password: ""
        };
    }

    componentDidMount() {
        this.addDisposable(ActiveUser.instance.user.subscribe((activeUser) => this.setState({ activeUser })));
    }

    async onCancel() {
        this.context.router.goBack();
    }

    async _signin() {
        const response = await signin(this.state.emailOrId, this.state.password);
        this.log("Sign in response", response);
        if (response.success) {
            this.context.router.push({
                pathname: "/"
            });
        }
    }

    async _signout() {
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

        const userLoggedIn = this.state.activeUser.get("userLoggedIn");

        return (
            <TAForm
                confirmAllowed={true}
                confirmText={userLoggedIn ? "sign out" : "sign in"}
                primaryText={`CodeFarm - ${userLoggedIn ? "Sign Out" : "Sign In"}`}
                onConfirm={() => userLoggedIn ? this._signout() : this._signin()}
                onCancel={() => this.onCancel()}
            >
                {userLoggedIn ? (
                    <div>
                        User {this.state.activeUser.get("username")} currently signed in.
                    </div>
                ) : (
                    <div>
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
                    </div>
                )}
            </TAForm>
        );
    }
}

SignInOutForm.propTypes = {
    theme: React.PropTypes.object
};

SignInOutForm.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default SignInOutForm;
