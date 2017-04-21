
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { AppLoader } from "ui-components/app_loader";
import { AppTopBar } from "ui-components/app_top_bar";
import { AppNotification } from "ui-components/app_notification";

class AppLayout extends LightComponent {
    render() {
        return (
            <div className={this.props.theme.appLayout}>
                <AppLoader />
                <AppTopBar/>
                {this.props.children}
                <AppNotification/>
            </div>
        );
    }
}

AppLayout.propTypes = {
    children: PropTypes.node,
    theme: PropTypes.object
};

export default AppLayout;
