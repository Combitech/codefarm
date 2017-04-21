import React from "react";
import PropTypes from "prop-types";
import { AppMenu } from "ui-components/app_menu";
import LightComponent from "ui-lib/light_component";
import List from "./List";

class AppNotificationsPage extends LightComponent {
    render() {
        this.log("render", this.props);

        return (
            <div>
                <AppMenu
                    primaryText="Notifications"
                    icon="/Cheser/256x256/status/user-status-pending.png"
                    items={[]}
                />
                <div className={this.props.theme.content}>
                    <List theme={this.props.theme} />
                </div>
            </div>
        );
    }
}

AppNotificationsPage.propTypes = {
    theme: PropTypes.object,
    children: PropTypes.node,
    route: PropTypes.object.isRequired
};

AppNotificationsPage.contextTypes = {
    router: PropTypes.object.isRequired
};

export default AppNotificationsPage;
