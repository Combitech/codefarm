
import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import LightComponent from "ui-lib/light_component";
import {
    Section as TASection
} from "ui-components/type_admin";
import { List, ListItem } from "react-toolbox/lib/list";
import Notification from "ui-observables/notification";

const msgTypeIcon = {
    accept: "info",
    warning: "warning",
    cancel: "cancel",
    "undefined": "help_outline"
};

class NotificationList extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            messages: Notification.instance.messages.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(Notification.instance.messages.subscribe((messages) => this.setState({ messages })));
    }

    render() {
        const breadcrumbs = [ {
            label: "Notifications",
            pathname: this.getPathname()
        } ];

        const formatTimestamp = (value) => moment(value).format("YYYY-MM-DD HH:mm:ss");

        return (
            <TASection
                breadcrumbs={breadcrumbs}
            >
                <List theme={this.props.theme}>
                    {this.state.messages.map((msg, index) => (
                        <ListItem
                            key={index}
                            theme={this.props.theme}
                            caption={msg.get("msg")}
                            legend={formatTimestamp(msg.get("timestamp"))}
                            leftIcon={msgTypeIcon[msg.get("type")]}
                        />
                    ))}
                </List>
            </TASection>
        );
    }
}
/*
*/
NotificationList.propTypes = {
    theme: PropTypes.object
};

export default NotificationList;
