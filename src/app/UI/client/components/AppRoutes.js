
import React from "react";
import PropTypes from "prop-types";
import { Router, browserHistory } from "react-router";

/* global window */

class AppRoutes extends React.Component {
    render() {
        return (
            <Router
                history={browserHistory}
                routes={this.props.routes}
                onUpdate={() => window.scrollTo(0, 0)}
            />
        );
    }
}


AppRoutes.propTypes = {
    routes: PropTypes.element.isRequired
};

export default AppRoutes;
