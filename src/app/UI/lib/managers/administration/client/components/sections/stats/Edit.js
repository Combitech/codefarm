
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

class Edit extends LightComponent {
    constructor(props) {
        super(props);

        this.itemProperties = {
            "_id": {
                editable: false,
                required: () => true,
                defaultValue: ""
            },
            "description": {
                editable: true,
                required: () => false,
                defaultValue: ""
            },
            "initialState": {
                editable: true,
                required: () => false,
                defaultValue: "",
                serialize: (input) => typeof input === "string" && input.length > 0 ? JSON.parse(input) : null,
                deserialize: (jsObj) => typeof jsObj !== "string" ? JSON.stringify(jsObj, null, 2) : jsObj
            },
            "script": {
                editable: true,
                required: () => true,
                defaultValue: ""
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
        await this.props.onSave("stat.spec", data, {
            create: !this.props.item
        });
    }

    _validate() {
        const inputsValid = tautils.isValid(this.state, this.itemProperties);

        let scriptErrorMsg = "";
        try {
            new Function(this.state.script.value); // eslint-disable-line no-new-func
        } catch (error) {
            console.log("script JSON serialization failed:", error.message);
            scriptErrorMsg = error.message;
        }

        let initialStateErrorMsg = "";
        try {
            this.itemProperties.initialState.serialize(
                this.state.initialState.value
            );
        } catch (error) {
            console.log("initialState JSON serialization failed:", error.message);
            initialStateErrorMsg = error.message;
        }

        return {
            confirmAllowed: inputsValid && initialStateErrorMsg.length === 0,
            initialStateErrorMsg,
            scriptErrorMsg
        };
    }

    render() {
        this.log("render", this.props, this.state);

        const {
            confirmAllowed,
            initialStateErrorMsg,
            scriptErrorMsg
        } = this._validate();

        return (
            <TASection
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
                menuItems={this.props.menuItems}
            >
                <TAForm
                    confirmAllowed={confirmAllowed}
                    confirmText={this.props.item ? "Save" : "Create"}
                    primaryText={`${this.props.item ? "Edit" : "Create"} statistics specification`}
                    secondaryText="A statistics specification specifies which data to collect"
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
                        error={scriptErrorMsg}
                    />
                    <Input
                        theme={this.props.theme}
                        className={this.props.theme.monospaceInput}
                        type="text"
                        label="Initial state"
                        name="initialState"
                        floating={true}
                        multiline={true}
                        required={this.itemProperties.initialState.required()}
                        disabled={this.props.item && !this.itemProperties.initialState.editable}
                        value={this.state.initialState.value}
                        onChange={this.state.initialState.set}
                        error={initialStateErrorMsg}
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
