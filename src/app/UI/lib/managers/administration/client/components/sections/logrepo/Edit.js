
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import Dropdown from "react-toolbox/lib/dropdown";
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
            type: "logrepo.backend"
        });

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
            "backend": {
                editable: false,
                required: () => true,
                defaultValue: ""
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
        await this.props.onSave("logrepo.repository", data, {
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
                    primaryText={`${this.props.item ? "Edit" : "Create"} log repository`}
                    secondaryText="A log repository contains binary file versions"
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
