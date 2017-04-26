
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import Dropdown from "react-toolbox/lib/dropdown";
import Autocomplete from "react-toolbox/lib/autocomplete";
import Slider from "react-toolbox/lib/slider";
import {
    Form as TAForm,
    Section as TASection,
    utils as tautils
} from "ui-components/type_admin";

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
            },
            "privateKeyPath": {
                editable: true,
                required: () => this.state.backendType.value === BACKEND_TYPE.DIRECT,
                defaultValue: ""
            },
            "hostUrl": {
                editable: true,
                required: () => this.state.backendType.value === BACKEND_TYPE.JENKINS,
                defaultValue: ""
            },
            "authUser": {
                editable: true,
                required: () => true,
                defaultValue: ""
            },
            "authToken": {
                editable: true,
                required: () => this.state.backendType.value === BACKEND_TYPE.JENKINS,
                defaultValue: ""
            },
            "port": {
                editable: true,
                required: () => this.state.backendType.value === BACKEND_TYPE.JENKINS,
                defaultValue: ""
            },
            "pollDelay": {
                editable: true,
                required: () => this.state.backendType.value === BACKEND_TYPE.JENKINS,
                defaultValue: 5000
            }
        };

        this.state = tautils.createStateProperties(this, this.itemProperties, this.props.item);
    }

    getBackendTypes() {
        return [
            { value: BACKEND_TYPE.DIRECT, label: "Direct" },
            { value: BACKEND_TYPE.JENKINS, label: "Jenkins" }
        ];
    }

    async onConfirm() {
        const data = tautils.serialize(this.state, this.itemProperties, this.props.item);
        await this.props.onSave("exec.backend", data, {
            create: !this.props.item
        });
    }

    render() {
        console.log("EditLocal-RENDER", this.props, this.state);

        const backendTypes = this.getBackendTypes();

        return (
            <TASection
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
            >
                <TAForm
                    confirmAllowed={tautils.isValid(this.state, this.itemProperties)}
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
                    {this.state.backendType.value === BACKEND_TYPE.DIRECT &&
                        <div>
                            <Input
                                type="text"
                                label="Path to private key for the login user"
                                name="privateKeyPath"
                                floating={true}
                                required={this.itemProperties.privateKeyPath.required()}
                                disabled={this.props.item && !this.itemProperties.privateKeyPath.editable}
                                value={this.state.privateKeyPath.value}
                                onChange={this.state.privateKeyPath.set}
                            />
                            <Input
                                type="text"
                                label="User to authenticate as"
                                name="authUser"
                                floating={true}
                                required={this.itemProperties.authUser.required()}
                                disabled={this.props.item && !this.itemProperties.authUser.editable}
                                value={this.state.authUser.value}
                                onChange={this.state.authUser.set}
                            />
                        </div>
                    }
                    {this.state.backendType.value === BACKEND_TYPE.JENKINS &&
                        <div>
                            <Input
                                type="text"
                                label="Jenkins host URL"
                                name="hostUrl"
                                floating={true}
                                required={this.itemProperties.hostUrl.required()}
                                disabled={this.props.item && !this.itemProperties.hostUrl.editable}
                                value={this.state.hostUrl.value}
                                onChange={this.state.hostUrl.set}
                            />
                            <Input
                                type="text"
                                label="Jenkins user to authenticate as"
                                name="authUser"
                                floating={true}
                                required={this.itemProperties.authUser.required()}
                                disabled={this.props.item && !this.itemProperties.authUser.editable}
                                value={this.state.authUser.value}
                                onChange={this.state.authUser.set}
                            />
                            <Input
                                type="text"
                                label="Jenkins user token to authenticate with"
                                name="authToken"
                                floating={true}
                                required={this.itemProperties.authToken.required()}
                                disabled={this.props.item && !this.itemProperties.authToken.editable}
                                value={this.state.authToken.value}
                                onChange={this.state.authToken.set}
                            />
                            <Input
                                type="number"
                                label="Notification port for Jenkins events"
                                name="port"
                                floating={true}
                                required={this.itemProperties.port.required()}
                                disabled={this.props.item && !this.itemProperties.port.editable}
                                value={this.state.port.value}
                                onChange={this.state.port.set}
                            />
                            <div>
                                <div className={this.props.theme.subtitle}>Jenkins console poll delay (msec)</div>
                                <Slider
                                    pinned={true}
                                    snaps={true}
                                    min={1000}
                                    max={25000}
                                    step={1000}
                                    required={this.itemProperties.pollDelay.required()}
                                    editable={!(this.props.item && !this.itemProperties.pollDelay.editable)}
                                    value={this.state.pollDelay.value}
                                    onChange={this.state.pollDelay.set}
                                />
                            </div>
                        </div>
                    }
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
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default Edit;
