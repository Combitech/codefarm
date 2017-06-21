
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import {
    utils as tautils
} from "ui-components/type_admin";

class Backend1Edit extends LightComponent {
    constructor(props) {
        super(props);
        console.log("!! backend1Edit ctor");

        this.itemProperties = {
            "prop1": {
                editable: true,
                required: () => true,
                defaultValue: ""
            },
            "prop2": {
                editable: true,
                required: () => false,
                defaultValue: ""
            }
        };

        this.state = tautils.createStateProperties(this, this.itemProperties, this.props.item);
    }

    _formDataUpdated() {
        const data = tautils.serialize(this.state, this.itemProperties, this.props.item);
        const isValid = tautils.isValid(this.state, this.itemProperties);
        this.props.data.set(data);
        this.props.isValid.set(isValid);
    }

    render() {
        return (
            <div>
                <Input
                    type="text"
                    label="First backend property"
                    name="prop1"
                    floating={true}
                    required={this.itemProperties.prop1.required()}
                    disabled={this.props.item && !this.itemProperties.prop1.editable}
                    value={this.state.prop1.value}
                    onChange={(value) => this.state.prop1.set(value, this._formDataUpdated.bind(this))}
                />
                <Input
                    type="text"
                    label="Second backend property"
                    name="prop2"
                    floating={true}
                    required={this.itemProperties.prop2.required()}
                    disabled={this.props.item && !this.itemProperties.prop2.editable}
                    value={this.state.prop2.value}
                    onChange={(value) => this.state.prop2.set(value, this._formDataUpdated.bind(this))}
                />
            </div>
        );
    }
}

Backend1Edit.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object,
    data: PropTypes.object,
    isValid: PropTypes.object
};

export default Backend1Edit;
