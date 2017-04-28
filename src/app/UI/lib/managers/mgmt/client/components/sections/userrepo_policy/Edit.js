
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import Autocomplete from "react-toolbox/lib/autocomplete";
import {
    Form as TAForm,
    Section as TASection,
    utils as tautils
} from "ui-components/type_admin";
import { validatePrivilegeFormat } from "auth/lib/util";
import arrayToSentence from "array-to-sentence";

class Edit extends LightComponent {
    constructor(props) {
        super(props);

        this.itemProperties = {
            "_id": {
                editable: true,
                required: () => true,
                defaultValue: ""
            },
            "description": {
                editable: true,
                required: () => false,
                defaultValue: ""
            },
            "privileges": {
                editable: true,
                required: () => true,
                defaultValue: []
            }
        };

        this.state = tautils.createStateProperties(this, this.itemProperties, this.props.item);
    }

    async onConfirm() {
        const data = tautils.serialize(this.state, this.itemProperties, this.props.item);
        await this.props.onSave("userrepo.policy", data, {
            create: !this.props.item
        });
    }

    isValid() {
        let formValid = tautils.isValid(this.state, this.itemProperties);

        if (formValid) {
            const privileges = this.state.privileges.value;
            formValid = privileges
                .map((priv) => this.isValidPrivilege(priv))
                .every((isValid) => isValid);
        }

        return formValid;
    }

    isValidPrivilege(privilege, logError = true) {
        let isValid = false;
        try {
            isValid = validatePrivilegeFormat(privilege);
        } catch (error) {
            logError && console.log("Invalid privilege:", error.message);
        }

        return isValid;
    }

    render() {
        console.log("EditLocal-RENDER", this.props, this.state);

        const privileges = this.state.privileges.value;

        const invalidPrivileges = privileges.filter((priv) => !this.isValidPrivilege(priv, false));

        let privilegeErrorMessage = "";
        if (invalidPrivileges.length === 1) {
            privilegeErrorMessage = `Privilege ${arrayToSentence(invalidPrivileges)} has invalid format`;
        } else if (invalidPrivileges.length > 1) {
            privilegeErrorMessage = `Privileges ${arrayToSentence(invalidPrivileges, { separator: "; " })} has invalid format`;
        }

        return (
            <TASection
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
                menuItems={this.props.menuItems}
            >
                <TAForm
                    confirmAllowed={this.isValid()}
                    confirmText={this.props.item ? "Save" : "Create"}
                    primaryText={`${this.props.item ? "Edit" : "Create"} user policy`}
                    secondaryText="A user policy contains a set of privileges. Note! Changes take effect for affected users at new login."
                    onConfirm={() => this.onConfirm()}
                    onCancel={() => this.props.onCancel()}
                >
                    <Input
                        type="text"
                        label="Name"
                        name="_id"
                        floating={true}
                        required={this.itemProperties._id.required()}
                        disabled={this.props.item && !this.itemProperties._id.editable}
                        value={this.state._id.value}
                        onChange={this.state._id.set}
                    />
                    <Input
                        type="text"
                        label="Description"
                        name="description"
                        floating={true}
                        required={this.itemProperties.description.required()}
                        disabled={this.props.item && !this.itemProperties.description.editable}
                        value={this.state.description.value}
                        onChange={this.state.description.set}
                    />
                    <Autocomplete
                        selectedPosition="below"
                        allowCreate={true}
                        label="Privileges"
                        disabled={this.props.item && !this.itemProperties.privileges.editable}
                        onChange={this.state.privileges.set}
                        source={privileges}
                        value={privileges}
                        error={privilegeErrorMessage}
                    />
                </TAForm>
            </TASection>
        );
    }
}

Edit.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object,
    pathname: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    menuItems: PropTypes.array.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default Edit;
