
import React from "react";
import ImmutablePropTypes from "react-immutable-proptypes";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import {
    Form as TAForm,
    Section as TASection
} from "ui-components/type_admin";
import api from "api.io/api.io-client";
import Notification from "ui-observables/notification";

class UserAddKey extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            key: ""
        };
    }

    async _onConfirm() {
        const data = this.state.key.toString();
        const userId = this.props.activeUser.get("id");
        try {
            const response = await api.rest.action("userrepo.user", userId, "addkey", data);
            console.log("_onConfirm: addkey response", response);
            if (response && response._id === userId) {
                Notification.instance.publish(`Public key added for user ${userId}`);
            } else {
                throw response.message || "Negative response";
            }
        } catch (error) {
            const errorMsg = `Failed to add key for user ${userId}: ${error.message || error}`;
            Notification.instance.publish(errorMsg, "warning");
        }
    }

    async _onCancel() {
        this.context.router.goBack();
    }

    _confirmAllowed() {
        return (typeof this.state.key === "string") && (this.state.key.length > 0);
    }

    render() {
        this.log("render", this.props, this.state);

        const user = this.props.activeUser.toJS();
        // Check that we have navigated to correct parent
        const isCorrectParent = this.props.parentItems
            .some((item) => item.type === "userrepo.user" && item._id === user.id);

        return (
            <TASection
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
            >
                {isCorrectParent ? (
                    <TAForm
                        confirmAllowed={this._confirmAllowed()}
                        confirmText={"Add key"}
                        primaryText={`Add public SSH key for user ${user.username}`}
                        secondaryText={"Public SSH keys are used for authenticating users connecting to CodeFarm SSH servers."}
                        onConfirm={() => this._onConfirm()}
                        onCancel={() => this._onCancel()}
                    >
                        <Input
                            type="text"
                            label="SSH Public Key"
                            name="key"
                            floating={true}
                            required={true}
                            multiline={true}
                            rows={10}
                            value={this.state.key}
                            onChange={(key) => this.setState({ key })}
                            hint="Paste SSH public key here..."
                        />
                    </TAForm>
                ) : (
                    <div>User is not signed in!</div>
                )}
            </TASection>
        );
    }
}

UserAddKey.propTypes = {
    theme: React.PropTypes.object,
    parentItems: React.PropTypes.array.isRequired,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired,
    activeUser: ImmutablePropTypes.map.isRequired
};

UserAddKey.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default UserAddKey;
