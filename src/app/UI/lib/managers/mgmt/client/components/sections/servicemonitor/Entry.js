import React from "react";

class Entry extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        console.log("Entry-RENDER", this.props);

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
    theme: React.PropTypes.object,
    label: React.PropTypes.string.isRequired,
    pathname: React.PropTypes.string.isRequired,
    ServiceMonitorComponent: React.PropTypes.func,
    children: React.PropTypes.node
};

export default Entry;
