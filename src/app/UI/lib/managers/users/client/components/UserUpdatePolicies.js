
import React from "react";
import LightComponent from "ui-lib/light_component";
import Autocomplete from "react-toolbox/lib/autocomplete";
import {
    Form as TAForm,
    Section as TASection,
    utils as tautils
} from "ui-components/type_admin";
import ActiveUser from "ui-observables/active_user";
import api from "api.io/api.io-client";
import { isTokenValidForAccess } from "auth/lib/util";
import TypeList from "ui-observables/type_list";
import Notification from "ui-observables/notification";

class UserUpdatePolicies extends LightComponent {
    constructor(props) {
        super(props);

        this.availablePolicyList = new TypeList({
            type: "userrepo.policy"
        });

        const user = this._getUser(props);
        const initialPolicies = user ? user.policyRefs.map((ref) => ref.id) : [];

        this.itemProperties = {
            "policies": {
                editable: true,
                required: () => true,
                defaultValue: initialPolicies
            }
        };

        this.state = Object.assign({
            activeUser: ActiveUser.instance.user.getValue(),
            availablePolicies: this.availablePolicyList.value.getValue()
        }, tautils.createStateProperties(this, this.itemProperties));
    }

    componentDidMount() {
        this.log("componentDidMount", this.props, this.state);
        this.addDisposable(ActiveUser.instance.user.subscribe((activeUser) => this.setState({ activeUser })));
        this.addDisposable(this.availablePolicyList.start());
        this.addDisposable(this.availablePolicyList.value.subscribe((availablePolicies) => this.setState({ availablePolicies })));
    }

    componentDidUpdate(prevProps) {
        this.log("componentDidUpdate", this.props, prevProps);
        const prevUser = this._getUser(prevProps);
        const user = this._getUser();
        if (JSON.stringify(user && user.policyRefs) !== JSON.stringify(prevUser && prevUser.policyRefs)) {
            const nextPolicies = user.policyRefs.map((ref) => ref.id);
            this.state.policies.set(nextPolicies);
        }
    }

    async _onConfirm() {
        const data = tautils.serialize(this.state, this.itemProperties);
        const user = this._getUser();
        try {
            const response = await api.rest.action("userrepo.user", user._id, "setpolicies", data);
            console.log("_onConfirm: setpolicies response", response);
            if (response && response._id === user._id) {
                Notification.instance.publish(`Policies updated for user ${user._id}`);
            } else {
                throw response.message || "Negative response";
            }
        } catch (error) {
            const errorMsg = `Failed to set policies for user ${user._id}: ${error.message || error}`;
            Notification.instance.publish(errorMsg, "warning");
        }
    }

    async _onCancel() {
        this.context.router.goBack();
    }

    _confirmAllowed() {
        const user = this._getUser();
        const inputsValid = tautils.isValid(this.state, this.itemProperties);

        return user && inputsValid;
    }

    _getUser(props = null) {
        props = props || this.props;

        return props.parentItems.find((item) => item.type === "userrepo.user");
    }

    render() {
        this.log("render", this.props, this.state);

        const signedInUser = this.state.activeUser.toJS();
        // Check that we have access to update policies
        let accessError;
        try {
            isTokenValidForAccess(signedInUser.priv, "userrepo.user", "setpolicies");
        } catch (error) {
            accessError = error.message;
        }

        const availablePolicies = {};
        for (const policy of this.state.availablePolicies.toJS()) {
            let policyItemText = `${policy._id}`;
            if (policy.description) {
                policyItemText = `${policyItemText} - ${policy.description}`;
            }
            availablePolicies[policy._id] = policyItemText;
        }
        const user = this._getUser();

        return (
            <TASection
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
            >
                {accessError ? (
                    <div>{accessError}</div>
                ) : (user && (
                    <TAForm
                        confirmAllowed={this._confirmAllowed()}
                        confirmText={"Update policies"}
                        primaryText={`Update policies for ${user.name}`}
                        onConfirm={() => this._onConfirm()}
                        onCancel={() => this._onCancel()}
                    >
                        <Autocomplete
                            selectedPosition="below"
                            allowCreate={false}
                            label="Policies"
                            disabled={!this.itemProperties.policies.editable}
                            onChange={this.state.policies.set}
                            source={availablePolicies}
                            value={this.state.policies.value}
                        />
                    </TAForm>
                ))}
            </TASection>
        );
    }
}

UserUpdatePolicies.propTypes = {
    theme: React.PropTypes.object,
    parentItems: React.PropTypes.array.isRequired,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired,
    onSave: React.PropTypes.func,
    onCancel: React.PropTypes.func
};

UserUpdatePolicies.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default UserUpdatePolicies;
