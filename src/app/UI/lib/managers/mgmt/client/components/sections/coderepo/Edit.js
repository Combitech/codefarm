
import React from "react";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import Dropdown from "react-toolbox/lib/dropdown";
import Autocomplete from "react-toolbox/lib/autocomplete";
import Checkbox from "react-toolbox/lib/checkbox";
import {
    Form as TAForm,
    Section as TASection,
    utils as tautils
} from "ui-components/type_admin";

const BACKEND_TYPE = {
    GERRIT: "gerrit",
    GITHUB: "github"
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
                defaultValue: BACKEND_TYPE.GERRIT
            },
            "uri": {
                editable: true,
                required: () => this.state.backendType.value === BACKEND_TYPE.GERRIT,
                defaultValue: "ssh://admin@localhost:29418"
            },
            "privateKeyPath": {
                editable: true,
                required: () => this.state.backendType.value === BACKEND_TYPE.GERRIT,
                defaultValue: ""
            },
            "target": {
                editable: true,
                required: () => this.state.backendType.value === BACKEND_TYPE.GITHUB,
                defaultValue: ""
            },
            "isOrganization": {
                editable: true,
                required: () => this.state.backendType.value === BACKEND_TYPE.GITHUB,
                defaultValue: true
            },
            "authUser": {
                editable: true,
                required: () => this.state.backendType.value === BACKEND_TYPE.GITHUB,
                defaultValue: ""
            },
            "authToken": {
                editable: true,
                required: () => this.state.backendType.value === BACKEND_TYPE.GITHUB,
                defaultValue: ""
            },
            "webhookURL": {
                editable: true,
                required: () => this.state.backendType.value === BACKEND_TYPE.GITHUB,
                defaultValue: ""
            },
            "port": {
                editable: true,
                required: () => this.state.backendType.value === BACKEND_TYPE.GITHUB,
                defaultValue: ""
            }
        };

        this.state = tautils.createStateProperties(this, this.itemProperties, this.props.item);
    }

    getBackendTypes() {
        return [
            { value: BACKEND_TYPE.GERRIT, label: "Gerrit" },
            { value: BACKEND_TYPE.GITHUB, label: "GitHub" }
        ];
    }

    async onConfirm() {
        const data = tautils.serialize(this.state, this.itemProperties, this.props.item);
        await this.props.onSave("coderepo.backend", data, {
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
                    primaryText={`${this.props.item ? "Edit" : "Create"} code repository backend`}
                    secondaryText="A code repository backend contains information about..."
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
                    {this.state.backendType.value === BACKEND_TYPE.GERRIT &&
                        <div>
                            <Input
                                type="url"
                                label="URI to use when connecting to gerrit"
                                name="uri"
                                floating={true}
                                required={this.itemProperties.uri.required()}
                                disabled={this.props.item && !this.itemProperties.uri.editable}
                                value={this.state.uri.value}
                                onChange={this.state.uri.set}
                            />
                            <Input
                                type="text"
                                label="Path to private key for the user specified in Gerrit URI"
                                name="privateKeyPath"
                                floating={true}
                                required={this.itemProperties.privateKeyPath.required()}
                                disabled={this.props.item && !this.itemProperties.privateKeyPath.editable}
                                value={this.state.privateKeyPath.value}
                                onChange={this.state.privateKeyPath.set}
                            />
                        </div>
                    }
                    {this.state.backendType.value === BACKEND_TYPE.GITHUB &&
                        <div>
                            <Input
                                type="text"
                                label="GitHub target (organization or user)"
                                name="target"
                                floating={true}
                                required={this.itemProperties.target.required()}
                                disabled={this.props.item && !this.itemProperties.target.editable}
                                value={this.state.target.value}
                                onChange={this.state.target.set}
                            />
                            <Checkbox
                                type="text"
                                label="Target is an organization"
                                name="isOrganization"
                                required={this.itemProperties.isOrganization.required()}
                                disabled={this.props.item && !this.itemProperties.isOrganization.editable}
                                checked={this.state.isOrganization.value}
                                onChange={this.state.isOrganization.set}
                            />
                            <Input
                                type="text"
                                label="Github user to authenticate as"
                                name="authUser"
                                floating={true}
                                required={this.itemProperties.authUser.required()}
                                disabled={this.props.item && !this.itemProperties.authUser.editable}
                                value={this.state.authUser.value}
                                onChange={this.state.authUser.set}
                            />
                            <Input
                                type="text"
                                label="GitHub user authentication token"
                                name="authToken"
                                floating={true}
                                required={this.itemProperties.authToken.required()}
                                disabled={this.props.item && !this.itemProperties.authToken.editable}
                                value={this.state.authToken.value}
                                onChange={this.state.authToken.set}
                            />
                            <Input
                                type="url"
                                label="Webhook callback URL"
                                name="webhookURL"
                                floating={true}
                                required={this.itemProperties.webhookURL.required()}
                                disabled={this.props.item && !this.itemProperties.webhookURL.editable}
                                value={this.state.webhookURL.value}
                                onChange={this.state.webhookURL.set}
                            />
                            <Input
                                type="number"
                                label="Local port for webhooks"
                                name="port"
                                floating={true}
                                required={this.itemProperties.port.required()}
                                disabled={this.props.item && !this.itemProperties.port.editable}
                                value={this.state.port.value}
                                onChange={this.state.port.set}
                            />
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
    theme: React.PropTypes.object,
    item: React.PropTypes.object,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired,
    onSave: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired
};

export default Edit;
