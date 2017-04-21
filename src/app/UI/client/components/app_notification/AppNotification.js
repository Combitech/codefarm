
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import Snackbar from "react-toolbox/lib/snackbar";
import Notification from "ui-observables/notification";

class AppNotification extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            msgInfo: Notification.instance.msg.getValue(),
            dismissed: false
        };
    }

    componentDidMount() {
        this.addDisposable(Notification.instance.msg.subscribe((msgInfo) => this.setState({
            msgInfo,
            // New message, reset dismissed
            dismissed: false
        })));
    }

    _closeSnackbar() {
        this.setState({ dismissed: true });
    }

    render() {
        const msgInfo = this.state.msgInfo.toJS();
        const active = !this.state.dismissed && msgInfo && Object.keys(msgInfo).length > 0 && msgInfo.msg.length > 0;

        return (
            <Snackbar
                action="Dismiss"
                active={active}
                label={msgInfo.msg}
                timeout={msgInfo.timeout}
                onClick={this._closeSnackbar.bind(this)}
                onTimeout={this._closeSnackbar.bind(this)}
                type={msgInfo.type}
            />
        );
    }
}

AppNotification.propTypes = {
    theme: PropTypes.object
};

export default AppNotification;
