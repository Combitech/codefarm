
import React from "react";
import PropTypes from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import LightComponent from "ui-lib/light_component";
import Autocomplete from "react-toolbox/lib/autocomplete";
import {
    Form as TAForm,
    Section as TASection,
    utils as tautils
} from "ui-components/type_admin";
import api from "api.io/api.io-client";
import { isTokenValidForAccess } from "auth/lib/util";
import TypeList from "ui-observables/type_list";
import Notification from "ui-observables/notification";

class UserUpdateTeams extends LightComponent {
    constructor(props) {
        super(props);

        this.availableTeamList = new TypeList({
            type: "userrepo.team"
        });

        const user = this._getUser(props);
        const initialTeams = user ? user.teams : [];

        this.itemProperties = {
            "teams": {
                editable: true,
                required: () => true,
                defaultValue: initialTeams
            }
        };

        this.state = Object.assign({
            availableTeams: this.availableTeamList.value.getValue()
        }, tautils.createStateProperties(this, this.itemProperties));
    }

    componentDidMount() {
        this.log("componentDidMount", this.props, this.state);
        this.addDisposable(this.availableTeamList.start());
        this.addDisposable(this.availableTeamList.value.subscribe((availableTeams) => this.setState({ availableTeams })));
    }

    componentDidUpdate(prevProps) {
        this.log("componentDidUpdate", this.props, prevProps);
        const prevUser = this._getUser(prevProps);
        const user = this._getUser();
        if (JSON.stringify(user && user.teams) !== JSON.stringify(prevUser && prevUser.teams)) {
            const nextTeams = user.teams;
            this.state.teams.set(nextTeams);
        }
    }

    async _onConfirm() {
        const data = tautils.serialize(this.state, this.itemProperties);
        const user = this._getUser();
        try {
            const response = await api.rest.action("userrepo.user", user._id, "setteams", data);
            console.log("_onConfirm: setteams response", response);
            if (response && response._id === user._id) {
                Notification.instance.publish(`Teams updated for user ${user._id}`);
            } else {
                throw response.message || "Negative response";
            }
        } catch (error) {
            const errorMsg = `Failed to set teams for user ${user._id}: ${error.message || error}`;
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

        const signedInUserPriv = this.props.activeUser.has("priv") && this.props.activeUser.get("priv").toJS();
        // Check that we have access to update teams
        let accessError;
        try {
            isTokenValidForAccess(signedInUserPriv, "userrepo.user", "setteams");
        } catch (error) {
            accessError = error.message;
        }

        const availableTeams = {};
        for (const team of this.state.availableTeams.toJS()) {
            let teamItemText = `${team._id}`;
            if (team.name) {
                teamItemText = `${teamItemText} - ${team.name}`;
            }
            availableTeams[team._id] = teamItemText;
        }
        const user = this._getUser();

        return (
            <TASection
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
                menuItems={this.props.menuItems}
            >
                <Choose>
                    <When condition={ accessError }>
                        <div>{accessError}</div>
                    </When>
                    <When condition={ user }>
                        <TAForm
                            confirmAllowed={this._confirmAllowed()}
                            confirmText={"Update teams"}
                            primaryText={`Update teams for ${user.name}`}
                            onConfirm={() => this._onConfirm()}
                            onCancel={() => this._onCancel()}
                        >
                            <Autocomplete
                                selectedPosition="below"
                                allowCreate={false}
                                label="Teams"
                                disabled={!this.itemProperties.teams.editable}
                                onChange={this.state.teams.set}
                                source={availableTeams}
                                value={this.state.teams.value}
                            />
                        </TAForm>
                    </When>
                </Choose>
            </TASection>
        );
    }
}

UserUpdateTeams.propTypes = {
    theme: PropTypes.object,
    parentItems: PropTypes.array.isRequired,
    pathname: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    menuItems: PropTypes.array.isRequired,
    activeUser: ImmutablePropTypes.map.isRequired
};

UserUpdateTeams.contextTypes = {
    router: PropTypes.object.isRequired
};

export default UserUpdateTeams;
