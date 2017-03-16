import React from "react";
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
                    icon="message"
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
    theme: React.PropTypes.object,
    children: React.PropTypes.node,
    route: React.PropTypes.object.isRequired
};

AppNotificationsPage.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default AppNotificationsPage;
