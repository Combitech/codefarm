
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

        tautils.createStateProperties(this, this.itemProperties, this.props.item);
    }

    async onConfirm() {
        const data = tautils.serialize(this, this.itemProperties, this.props.item);
        await this.props.onSave("userrepo.policy", data, {
            create: !this.props.item
        });
    }

    render() {
        console.log("EditLocal-RENDER", this.props, this.state);

        return (
            <TASection
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
            >
                <TAForm
                    confirmAllowed={tautils.isValid(this, this.itemProperties)}
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
                        source={this.state.privileges.value}
                        value={this.state.privileges.value}
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
