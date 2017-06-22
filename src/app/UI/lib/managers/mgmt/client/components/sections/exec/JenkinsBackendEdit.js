
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import Slider from "react-toolbox/lib/slider";
import {
    utils as tautils
} from "ui-components/type_admin";

class JenkinsBackendEdit extends LightComponent {
    constructor(props) {
        super(props);

        this.itemProperties = {
            "hostUrl": {
                editable: true,
                required: () => true,
                defaultValue: ""
            },
            "authUser": {
                editable: true,
                required: () => true,
                defaultValue: ""
            },
            "authToken": {
                editable: true,
                required: () => true,
                defaultValue: ""
            },
            "port": {
                editable: true,
                required: () => true,
                defaultValue: ""
            },
            "pollDelay": {
                editable: true,
                required: () => true,
                defaultValue: 5000
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

    componentDidMount() {
        this._formDataUpdated();
    }

    render() {
        return (
            <div>
                <Input
                    type="text"
                    label="Jenkins host URL"
                    name="hostUrl"
                    floating={true}
                    required={this.itemProperties.hostUrl.required()}
                    disabled={this.props.item && !this.itemProperties.hostUrl.editable}
                    value={this.state.hostUrl.value}
                    onChange={(value) => this.state.hostUrl.set(value, this._formDataUpdated.bind(this))}
                />
                <Input
                    type="text"
                    label="Jenkins user to authenticate as"
                    name="authUser"
                    floating={true}
                    required={this.itemProperties.authUser.required()}
                    disabled={this.props.item && !this.itemProperties.authUser.editable}
                    value={this.state.authUser.value}
                    onChange={(value) => this.state.authUser.set(value, this._formDataUpdated.bind(this))}
                />
                <Input
                    type="text"
                    label="Jenkins user token to authenticate with"
                    name="authToken"
                    floating={true}
                    required={this.itemProperties.authToken.required()}
                    disabled={this.props.item && !this.itemProperties.authToken.editable}
                    value={this.state.authToken.value}
                    onChange={(value) => this.state.authToken.set(value, this._formDataUpdated.bind(this))}
                />
                <Input
                    type="number"
                    label="Notification port for Jenkins events"
                    name="port"
                    floating={true}
                    required={this.itemProperties.port.required()}
                    disabled={this.props.item && !this.itemProperties.port.editable}
                    value={this.state.port.value}
                    onChange={(value) => this.state.port.set(value, this._formDataUpdated.bind(this))}
                />
                <div>
                    <div className={this.props.theme.subtitle}>
                        Jenkins console poll delay (msec)
                    </div>
                    <Slider
                        pinned={true}
                        snaps={true}
                        min={1000}
                        max={25000}
                        step={1000}
                        required={this.itemProperties.pollDelay.required()}
                        editable={!(this.props.item && !this.itemProperties.pollDelay.editable)}
                        value={this.state.pollDelay.value}
                        onChange={(value) => this.state.pollDelay.set(value, this._formDataUpdated.bind(this))}
                    />
                </div>
            </div>
        );
    }
}

JenkinsBackendEdit.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object,
    data: PropTypes.object,
    isValid: PropTypes.object
};

export default JenkinsBackendEdit;
