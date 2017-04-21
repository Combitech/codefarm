
import React from "react";
import PropTypes from "prop-types";
import sillyname from "sillyname";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import Dropdown from "react-toolbox/lib/dropdown";
import Slider from "react-toolbox/lib/slider";
import Autocomplete from "react-toolbox/lib/autocomplete";
import {
    Form as TAForm,
    Section as TASection,
    LoadIndicator as TALoadIndicator,
    utils as tautils
} from "ui-components/type_admin";
import TypeList from "ui-observables/type_list";
import { States as ObservableDataStates } from "ui-lib/observable_data";

class Edit extends LightComponent {
    constructor(props) {
        super(props);

        this.backendList = new TypeList({
            type: "exec.backend"
        });

        this.itemProperties = {
            "_id": {
                editable: false,
                required: () => true,
                defaultValue: sillyname().toLowerCase().replace(/ /g, "_")
            },
            "tags": {
                editable: true,
                required: () => false,
                defaultValue: []
            },
            "backend": {
                editable: false,
                required: () => true,
                defaultValue: ""
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

        this.state = Object.assign({
            backends: this.backendList.value.getValue(),
            backendsState: this.backendList.state.getValue()
        }, tautils.createStateProperties(this, this.itemProperties, this.props.item));
    }

    componentDidMount() {
        this.log("componentDidMount", this.props, this.state);
        this.addDisposable(this.backendList.start());
        this.addDisposable(this.backendList.value.subscribe((backends) => this.setState({ backends })));
        this.addDisposable(this.backendList.state.subscribe((backendsState) => this.setState({ backendsState })));
    }

    getBackends() {
        return this.state.backends.toJS().map((backend) => ({
            value: backend._id, label: backend._id
        }));
    }

    async onConfirm() {
        const data = tautils.serialize(this.state, this.itemProperties, this.props.item);
        await this.props.onSave("exec.slave", data, {
            create: !this.props.item
        });
    }

    render() {
        this.log("render", this.props, this.state);

        if (this.state.backendsState === ObservableDataStates.LOADING) {
            return (
                <TALoadIndicator />
            );
        }

        const backends = this.getBackends();

        return (
            <TASection
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
            >
                <TAForm
                    confirmAllowed={tautils.isValid(this.state, this.itemProperties)}
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
                    <Dropdown
                        label="Backend"
                        required={this.itemProperties.backend.required()}
                        disabled={this.props.item && !this.itemProperties.backend.editable}
                        onChange={this.state.backend.set}
                        source={backends}
                        value={this.state.backend.value}
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
    theme: PropTypes.object,
    item: PropTypes.object,
    pathname: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default Edit;
