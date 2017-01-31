
import React from "react";
import AppLoader from "ui-components/app_loader";
import AppTopBar from "ui-components/app_top_bar";

class Layout extends React.Component {
    render() {
        return (
            <div>
                <AppLoader />
                <AppTopBar/>
                {this.props.children}
            </div>
        );
    }
}

Layout.propTypes = {
    children: React.PropTypes.node
};

export default Layout;
