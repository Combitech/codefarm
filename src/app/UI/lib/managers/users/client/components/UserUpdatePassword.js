
import React from "react";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import {
    Form as TAForm,
    Section as TASection,
    utils as tautils
} from "ui-components/type_admin";
import ActiveUser from "ui-observables/active_user";
import { setPassword } from "ui-lib/auth";

class UserUpdatePassword extends LightComponent {
    constructor(props) {
        super(props);

        this.itemProperties = {
            "oldPassword": {
                editable: true,
                required: () => true,
                serialize: (value) => `${value}`,
                defaultValue: ""
            },
            "newPassword1": {
                editable: true,
                required: () => true,
                serialize: (value) => `${value}`,
                defaultValue: ""
            },
            "newPassword2": {
                editable: true,
                required: () => true,
                serialize: (value) => `${value}`,
                defaultValue: ""
            }
        };

        this.state = Object.assign({
            activeUser: ActiveUser.instance.user.getValue()
        }, tautils.createStateProperties(this, this.itemProperties));
    }

    componentDidMount() {
        this.addDisposable(ActiveUser.instance.user.subscribe((activeUser) => this.setState({ activeUser })));
    }

    async _onConfirm() {
        const data = tautils.serialize(this.state, this.itemProperties);
        await setPassword(this.state.activeUser.get("id"), data.oldPassword, data.newPassword1);
    }

    async _onCancel() {
        this.context.router.goBack();
    }

    _confirmAllowed() {
        const inputsValid = tautils.isValid(this.state, this.itemProperties);
        const newPasswordsEq = this.state.newPassword1.value && this.state.newPassword1.value === this.state.newPassword2.value;

        return inputsValid && newPasswordsEq;
    }

    render() {
        this.log("render", this.props, this.state);

        const user = this.state.activeUser.toJS();
        // Check that we have navigated to correct parent
        const isCorrectParent = this.props.parentItems.some((item) => item._id === user.id);

        return (
            <TASection
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
            >
                {isCorrectParent ? (
                    <TAForm
                        confirmAllowed={this._confirmAllowed()}
                        confirmText={"Update password"}
                        primaryText={`Update password for ${user.username}`}
                        onConfirm={() => this._onConfirm()}
                        onCancel={() => this._onCancel()}
                    >
                        <Input
                            type="password"
                            label="Current password"
                            name="oldPassword"
                            floating={true}
                            required={this.itemProperties.oldPassword.required()}
                            disabled={!this.itemProperties.oldPassword.editable}
                            value={this.state.oldPassword.value}
                            onChange={this.state.oldPassword.set}
                        />
                        <Input
                            type="password"
                            label="New password"
                            name="newPassword1"
                            floating={true}
                            required={this.itemProperties.newPassword1.required()}
                            disabled={!this.itemProperties.newPassword1.editable}
                            value={this.state.newPassword1.value}
                            onChange={this.state.newPassword1.set}
                        />
                        <Input
                            type="password"
                            label="New password again"
                            name="newPassword2"
                            floating={true}
                            required={this.itemProperties.newPassword2.required()}
                            disabled={!this.itemProperties.newPassword2.editable}
                            value={this.state.newPassword2.value}
                            onChange={this.state.newPassword2.set}
                        />
                    </TAForm>
                ) : (
                    <div>User is not signed in!</div>
                )}
            </TASection>
        );
    }
}

UserUpdatePassword.propTypes = {
    theme: React.PropTypes.object,
    parentItems: React.PropTypes.array.isRequired,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired,
    onSave: React.PropTypes.func,
    onCancel: React.PropTypes.func
};

UserUpdatePassword.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default UserUpdatePassword;
