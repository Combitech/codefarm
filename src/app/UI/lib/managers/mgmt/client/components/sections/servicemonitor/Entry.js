import React from "react";
import PropTypes from "prop-types";

class Entry extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const breadcrumbs = [
            {
                label: this.props.label,
                pathname: this.props.pathname
            }
        ];

        const props = {
            theme: this.props.theme,
            pathname: this.props.pathname,
            breadcrumbs: breadcrumbs,
            ServiceMonitorComponent: this.props.ServiceMonitorComponent
        };

        if (this.props.children) {
            return (
                <div>
                    {React.cloneElement(this.props.children, props)}
                </div>
            );
        }
    }
}

Entry.propTypes = {
    theme: PropTypes.object,
    label: PropTypes.string.isRequired,
    pathname: PropTypes.string.isRequired,
    ServiceMonitorComponent: PropTypes.func,
    children: PropTypes.node
};

export default Entry;
