
import React from "react";
import Component from "ui-lib/component";
import Input from "react-toolbox/lib/input";
import Autocomplete from "react-toolbox/lib/autocomplete";
import {
    Form as TAForm,
    Section as TASection,
    utils as tautils
} from "ui-components/type_admin";

class Edit extends Component {
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
            }
        };

        tautils.createStateProperties(this, this.itemProperties, this.props.item);
    }

    async onConfirm() {
        const data = tautils.serialize(this, this.itemProperties, this.props.item);
        await this.props.onSave("exec.job", data, {
            create: !this.props.item
        });
    }

    render() {
        this.log("render", this.props, this.state);

        return (
            <TASection
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
            >
                <TAForm
                    confirmAllowed={tautils.isValid(this, this.itemProperties)}
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
