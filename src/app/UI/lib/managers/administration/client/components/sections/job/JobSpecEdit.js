
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import Autocomplete from "react-toolbox/lib/autocomplete";
import Dropdown from "react-toolbox/lib/dropdown";
import {
    Form as TAForm,
    Section as TASection,
    utils as tautils
} from "ui-components/type_admin";

class JobSpecEdit extends LightComponent {
    constructor(props) {
        super(props);

        this.itemProperties = {
            "_id": {
                editable: false,
                required: () => props.item,
                defaultValue: props.item ? props.item._id : ""
            },
            "name": {
                editable: true,
                required: () => true,
                defaultValue: ""
            },
            "criteria": {
                editable: true,
                required: () => this.state.script.value !== "",
                defaultValue: ""
            },
            "script": {
                editable: true,
                required: () => false,
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
                defaultValue: "remove_on_finish"
            },
            "initialJobTags": {
                editable: true,
                required: () => false,
                defaultValue: []
            },
            "tags": {
                editable: true,
                required: () => false,
                defaultValue: []
            }
        };

        this.state = tautils.createStateProperties(this, this.itemProperties, this.props.item);
    }

    async onConfirm() {
        const data = tautils.serialize(this.state, this.itemProperties, this.props.item);
        const create = !this.props.item;
        if (create) {
            delete data._id;
        }

        await this.props.onSave("exec.jobspec", data, { create });
    }

    _validate() {
        return tautils.isValid(this.state, this.itemProperties);
    }

    render() {
        this.log("render", this.props, this.state);

        const confirmAllowed = this._validate();

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
                    confirmAllowed={confirmAllowed}
                    confirmText={this.props.item ? "Save" : "Create"}
                    primaryText={`${this.props.item ? "Edit" : "Create"} job specification`}
                    secondaryText="A job specification specifies how to run a job"
                    onConfirm={() => this.onConfirm()}
                    onCancel={() => this.props.onCancel()}
                >
                    <If condition={ this.props.item }>
                        <Input
                            type="text"
                            label="ID"
                            name="_id"
                            floating={true}
                            required={this.itemProperties._id.required()}
                            disabled={!this.itemProperties._id.editable}
                            value={this.state._id.value}
                            onChange={this.state._id.set}
                        />
                    </If>
                    <Input
                        type="text"
                        label="Job name"
                        name="name"
                        floating={true}
                        required={this.itemProperties.name.required()}
                        disabled={this.props.item && !this.itemProperties.name.editable}
                        value={this.state.name.value}
                        onChange={this.state.name.set}
                    />
                    <Input
                        type="text"
                        label="Slave Criteria"
                        hint="Tag criteria to match slave"
                        name="criteria"
                        floating={true}
                        required={this.itemProperties.criteria.required()}
                        disabled={this.props.item && !this.itemProperties.criteria.editable}
                        value={this.state.criteria.value}
                        onChange={this.state.criteria.set}
                    />
                    <Input
                        theme={this.props.theme}
                        className={this.props.theme.monospaceInput}
                        type="text"
                        label="Script"
                        name="script"
                        floating={true}
                        multiline={true}
                        required={this.itemProperties.script.required()}
                        disabled={this.props.item && !this.itemProperties.script.editable}
                        value={this.state.script.value}
                        onChange={this.state.script.set}
                    />
                    <Autocomplete
                        selectedPosition="below"
                        allowCreate={true}
                        label="Tags to add to jobs"
                        disabled={this.props.item && !this.itemProperties.initialJobTags.editable}
                        onChange={this.state.initialJobTags.set}
                        source={this.state.initialJobTags.value}
                        value={this.state.initialJobTags.value}
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

JobSpecEdit.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object,
    pathname: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    menuItems: PropTypes.array.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default JobSpecEdit;
