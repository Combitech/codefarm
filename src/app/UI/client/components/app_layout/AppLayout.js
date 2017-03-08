
import React from "react";
import AppLoader from "ui-components/app_loader";
import AppTopBar from "ui-components/app_top_bar";
import AppNotification from "ui-components/app_notification";

class AppLayout extends React.Component {
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
    children: React.PropTypes.node,
    theme: React.PropTypes.object
};

export default AppLayout;
