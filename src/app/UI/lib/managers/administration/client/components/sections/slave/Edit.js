
import React from "react";
import sillyname from "sillyname";
import Component from "ui-lib/component";
import Input from "react-toolbox/lib/input";
import Slider from "react-toolbox/lib/slider";
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
                editable: false,
                required: () => true,
                defaultValue: sillyname().toLowerCase().replace(" ", "_")
            },
            "tags": {
                editable: true,
                required: () => false,
                defaultValue: []
            },
            "uri": {
                editable: true,
                required: () => true,
                defaultValue: ""
            },
            "privateKeyPath": {
                editable: true,
                required: () => true,
                defaultValue: ""
            },
            "executors": {
                editable: true,
                required: () => true,
                defaultValue: 1
            }
        };

        tautils.createStateProperties(this, this.itemProperties, this.props.item);
    }

    async onConfirm() {
        const data = tautils.serialize(this, this.itemProperties, this.props.item);
        await this.props.onSave("exec.slave", data, {
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
                    primaryText={`${this.props.item ? "Edit" : "Create"} slave`}
                    secondaryText="A slave is a machine which can execute jobs via SSH"
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
                        label="URI"
                        name="uri"
                        hint="ssh://<username>@<hostname>:<port>/<workspace container path>"
                        floating={true}
                        required={this.itemProperties.uri.required()}
                        disabled={this.props.item && !this.itemProperties.uri.editable}
                        value={this.state.uri.value}
                        onChange={this.state.uri.set}
                    />
                    <Input
                        type="text"
                        label="Private Key Path"
                        name="privateKeyPath"
                        floating={true}
                        required={this.itemProperties.privateKeyPath.required()}
                        disabled={this.props.item && !this.itemProperties.privateKeyPath.editable}
                        value={this.state.privateKeyPath.value}
                        onChange={this.state.privateKeyPath.set}
                    />
                    <div>
                        <div className={this.props.theme.subtitle}>Executors *</div>
                        <Slider
                            pinned={true}
                            snaps={true}
                            min={1}
                            max={25}
                            step={1}
                            editable={!(this.props.item && !this.itemProperties.executors.editable)}
                            value={this.state.executors.value}
                            onChange={this.state.executors.set}
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
    theme: React.PropTypes.object,
    item: React.PropTypes.object,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired,
    onSave: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired
};

export default Edit;
