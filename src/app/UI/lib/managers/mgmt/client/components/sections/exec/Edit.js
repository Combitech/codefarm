
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
import stateVar from "ui-lib/state_var";
import DirectBackendEdit from "./DirectBackendEdit";
import JenkinsBackendEdit from "./JenkinsBackendEdit";
import { getPluginProp } from "ui-lib/plugin_util";

const BACKEND_TYPE = {
    DIRECT: "direct",
    JENKINS: "jenkins"
};

class Edit extends LightComponent {
    constructor(props) {
        super(props);

        this.itemProperties = {
            "_id": {
                editable: false,
                required: () => true,
                defaultValue: ""
            },
            "tags": {
                editable: true,
                required: () => false,
                defaultValue: []
            },
            "backendType": {
                editable: false,
                required: () => true,
                defaultValue: BACKEND_TYPE.DIRECT
            }
        };

        this.state = Object.assign({
            backendData: stateVar(this, "backendData", {}),
            backendDataValid: stateVar(this, "backendDataValid", false)
        }, tautils.createStateProperties(this, this.itemProperties, this.props.item));
    }

    getBackendTypes() {
        const backendTypes = [
            { value: BACKEND_TYPE.DIRECT, label: "Direct" },
            { value: BACKEND_TYPE.JENKINS, label: "Jenkins" }
        ];
        const fromPlugins = getPluginProp("exec.backend.edit.types");
        fromPlugins.forEach((v) => backendTypes.push(...v));

        return backendTypes;
    }

    async onConfirm() {
        const commonData = tautils.serialize(this.state, this.itemProperties, this.props.item);
        const backendData = this.state.backendData.value;
        const data = Object.assign({}, commonData, backendData);

        await this.props.onSave("exec.backend", data, {
            create: !this.props.item
        });
    }

    _isValid() {
        const commonValid = tautils.isValid(this.state, this.itemProperties);
        const backendValid = this.state.backendDataValid.value;

        return commonValid && backendValid;
    }

    render() {
        this.log("render", this.props, this.state);

        const backendTypes = this.getBackendTypes();
        let backendComponent;
        if (this.state.backendType.value === BACKEND_TYPE.DIRECT) {
            backendComponent = (
                <DirectBackendEdit
                    theme={this.props.theme}
                    item={this.props.item}
                    data={this.state.backendData}
                    isValid={this.state.backendDataValid}
                />
            );
        } else if (this.state.backendType.value === BACKEND_TYPE.JENKINS) {
            backendComponent = (
                <JenkinsBackendEdit
                    theme={this.props.theme}
                    item={this.props.item}
                    data={this.state.backendData}
                    isValid={this.state.backendDataValid}
                />
            );
        } else {
            const componentKey = `exec.backend.edit.component.${this.state.backendType.value}`;
            const pluginBackendComponent = getPluginProp(componentKey)[0];
            if (pluginBackendComponent) {
                backendComponent = (
                    <pluginBackendComponent
                        theme={this.props.theme}
                        item={this.props.item}
                        data={this.state.backendData}
                        isValid={this.state.backendDataValid}
                    />
                );
            }
        }

        return (
            <TASection
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
                menuItems={this.props.menuItems}
            >
                <TAForm
                    confirmAllowed={this._isValid()}
                    confirmText={this.props.item ? "Save" : "Create"}
                    primaryText={`${this.props.item ? "Edit" : "Create"} execution backend`}
                    secondaryText="An execution backend contains information about..."
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
                    <Dropdown
                        label="Backend type"
                        required={this.itemProperties.backendType.required()}
                        disabled={this.props.item && !this.itemProperties.backendType.editable}
                        onChange={this.state.backendType.set}
                        source={backendTypes}
                        value={this.state.backendType.value}
                    />
                    {backendComponent}
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
