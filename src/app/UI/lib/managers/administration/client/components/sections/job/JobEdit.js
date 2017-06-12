
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import Dropdown from "react-toolbox/lib/dropdown";
import Autocomplete from "react-toolbox/lib/autocomplete";
import {
    Form as TAForm,
    Section as TASection,
    utils as tautils
} from "ui-components/type_admin";

class JobEdit extends LightComponent {
    constructor(props) {
        super(props);

        this.itemProperties = {
            "name": {
                editable: false,
                required: () => true,
                defaultValue: ""
            },
            "tags": {
                editable: true,
                required: () => false,
                defaultValue: []
            },
            "criteria": {
                editable: true,
                required: () => true,
                defaultValue: ""
            },
            "script": {
                editable: true,
                required: () => true,
                defaultValue: ""
            },
            "workspaceName": {
                editable: true,
                required: () => false,
                defaultValue: ""
            },
            "workspaceCleanup": {
                editable: true,
                required: () => true,
                defaultValue: "keep"
            }
        };

        this.state = tautils.createStateProperties(this, this.itemProperties, this.props.item);
    }

    async onConfirm() {
        const data = tautils.serialize(this.state, this.itemProperties, this.props.item);
        await this.props.onSave("exec.job", data, {
            create: !this.props.item
        });
    }

    render() {
        this.log("render", this.props, this.state);

        const cleanupPolicies = [
            { value: "keep", label: "Do not remove" },
            { value: "remove_on_finish", label: "Remove on finish" },
            { value: "remove_on_success", label: "Remove on success" },
            { value: "remove_when_needed", label: "Remove when needed" }
        ];

        return (
            <TASection
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
                menuItems={this.props.menuItems}
            >
                <TAForm
                    confirmAllowed={tautils.isValid(this.state, this.itemProperties)}
                    confirmText={this.props.item ? "Save" : "Create"}
                    primaryText={`${this.props.item ? "Edit" : "Create"} job`}
                    secondaryText="A job is a script that will be executed on a slave"
                    onConfirm={() => this.onConfirm()}
                    onCancel={() => this.props.onCancel()}
                >
                    <Input
                        type="text"
                        label="Name"
                        name="name"
                        floating={true}
                        required={this.itemProperties.name.required()}
                        disabled={this.props.item && !this.itemProperties.name.editable}
                        value={this.state.name.value}
                        onChange={this.state.name.set}
                    />
                    <Input
                        type="text"
                        label="Slave matching criteria"
                        name="criteria"
                        floating={true}
                        required={this.itemProperties.criteria.required()}
                        disabled={this.props.item && !this.itemProperties.criteria.editable}
                        value={this.state.criteria.value}
                        onChange={this.state.criteria.set}
                    />
                    <Input
                        type="text"
                        label="Script"
                        name="script"
                        floating={true}
                        multiline={true}
                        rows={10}
                        required={this.itemProperties.script.required()}
                        disabled={this.props.item && !this.itemProperties.script.editable}
                        value={this.state.script.value}
                        onChange={this.state.script.set}
                    />
                    <Input
                        type="text"
                        label="Workspace Name"
                        name="workspaceName"
                        floating={true}
                        required={this.itemProperties.workspaceName.required()}
                        disabled={this.props.item && !this.itemProperties.workspaceName.editable}
                        value={this.state.workspaceName.value}
                        onChange={this.state.workspaceName.set}
                    />
                    <Dropdown
                        label="Workspace Cleanup Policy"
                        required={this.itemProperties.workspaceCleanup.required()}
                        disabled={this.props.item && !this.itemProperties.workspaceCleanup.editable}
                        onChange={this.state.workspaceCleanup.set}
                        source={cleanupPolicies}
                        value={this.state.workspaceCleanup.value}
                    />
                    <Autocomplete
                        selectedPosition="below"
                        allowCreate={true}
                        label="Tags"
                        disabled={this.props.item && !this.itemProperties.tags.editable}
                        onChange={this.state.tags.set}
                        source={this.state.tags.value}
                        value={this.state.tags.value}
                    />
                </TAForm>
            </TASection>
        );
    }
}

JobEdit.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object,
    pathname: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    menuItems: PropTypes.array.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default JobEdit;
