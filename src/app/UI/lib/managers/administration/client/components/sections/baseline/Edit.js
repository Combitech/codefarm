
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import Dropdown from "react-toolbox/lib/dropdown";
import Switch from "react-toolbox/lib/switch";
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
            "tags": {
                editable: true,
                required: () => false,
                defaultValue: []
            },
            "collectors[0].name": {
                editable: true,
                required: () => true,
                defaultValue: ""
            },
            "collectors[0].collectType": {
                editable: true,
                required: () => true,
                defaultValue: ""
            },
            "collectors[0].criteria": {
                editable: true,
                required: () => true,
                defaultValue: ""
            },
            "collectors[0].limit": {
                editable: true,
                required: () => true,
                defaultValue: 0
            },
            "collectors[0].latest": {
                editable: true,
                required: () => true,
                defaultValue: false
            }
        };

        this.state = tautils.createStateProperties(this, this.itemProperties, this.props.item);
    }

    getCollectTypes() {
        return [
            { value: "coderepo.revision", label: "Revision" },
            { value: "artifactrepo.artifact", label: "Artifact" },
            { value: "baselinerepo.baseline", label: "Baseline" }
        ];
    }

    async onConfirm() {
        const data = tautils.serialize(this.state, this.itemProperties, this.props.item);
        await this.props.onSave("baselinegen.specification", data, {
            create: !this.props.item
        });
    }

    render() {
        this.log("render", this.props, this.state);

        const collectTypes = this.getCollectTypes();

        return (
            <TASection
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
                menuItems={this.props.menuItems}
            >
                <TAForm
                    confirmAllowed={tautils.isValid(this.state, this.itemProperties)}
                    confirmText={this.props.item ? "Save" : "Create"}
                    primaryText={`${this.props.item ? "Edit" : "Create"} collector specification`}
                    secondaryText="A collector specification specifies how to collect ids based on a criteria"
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
                        label="Collector name"
                        name="collectors[0].name"
                        floating={true}
                        required={this.itemProperties["collectors[0].name"].required()}
                        disabled={this.props.item && !this.itemProperties["collectors[0].name"].editable}
                        value={this.state["collectors[0].name"].value}
                        onChange={this.state["collectors[0].name"].set}
                    />
                    <Dropdown
                        label="Collector type"
                        required={this.itemProperties["collectors[0].collectType"].required()}
                        disabled={this.props.item && !this.itemProperties["collectors[0].collectType"].editable}
                        onChange={this.state["collectors[0].collectType"].set}
                        source={collectTypes}
                        value={this.state["collectors[0].collectType"].value}
                    />
                    <Input
                        type="text"
                        label="Collector criteria"
                        name="collectors[0].criteria"
                        floating={true}
                        required={this.itemProperties["collectors[0].criteria"].required()}
                        disabled={this.props.item && !this.itemProperties["collectors[0].criteria"].editable}
                        value={this.state["collectors[0].criteria"].value}
                        onChange={this.state["collectors[0].criteria"].set}
                    />
                    <Input
                        type="number"
                        label="Collector limit"
                        name="collectors[0].limit"
                        floating={true}
                        required={this.itemProperties["collectors[0].limit"].required()}
                        disabled={this.props.item && !this.itemProperties["collectors[0].limit"].editable}
                        value={this.state["collectors[0].limit"].value}
                        onChange={this.state["collectors[0].limit"].set}
                    />
                    <div>
                        <div className={this.props.theme.subtitle}>Collect latest *</div>
                        <Switch
                            required={this.itemProperties["collectors[0].latest"].required()}
                            disabled={this.props.item && !this.itemProperties["collectors[0].latest"].editable}
                            checked={this.state["collectors[0].latest"].value}
                            onChange={this.state["collectors[0].latest"].set}
                        />
                    </div>
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
