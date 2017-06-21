
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import {
    utils as tautils
} from "ui-components/type_admin";

class DirectBackendEdit extends LightComponent {
    constructor(props) {
        super(props);

        this.itemProperties = {
            "privateKeyPath": {
                editable: true,
                required: () => true,
                defaultValue: ""
            },
            "authUser": {
                editable: true,
                required: () => true,
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
                    label="Path to private key for the login user"
                    name="privateKeyPath"
                    floating={true}
                    required={this.itemProperties.privateKeyPath.required()}
                    disabled={this.props.item && !this.itemProperties.privateKeyPath.editable}
                    value={this.state.privateKeyPath.value}
                    onChange={(value) => this.state.privateKeyPath.set(value, this._formDataUpdated.bind(this))}
                />
                <Input
                    type="text"
                    label="User to authenticate as"
                    name="authUser"
                    floating={true}
                    required={this.itemProperties.authUser.required()}
                    disabled={this.props.item && !this.itemProperties.authUser.editable}
                    value={this.state.authUser.value}
                    onChange={(value) => this.state.authUser.set(value, this._formDataUpdated.bind(this))}
                />
            </div>
        );
    }
}

DirectBackendEdit.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object,
    data: PropTypes.object,
    isValid: PropTypes.object
};

export default DirectBackendEdit;
