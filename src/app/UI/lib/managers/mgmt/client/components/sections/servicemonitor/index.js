
import React from "react";
import Component from "ui-lib/component";
import Entry from "./Entry";
import ServiceMonitor from "./ServiceMonitor";
import MonitorPage from "./MonitorPage";

class Index extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        console.log("indexLocal-RENDER", this.props);

        return (
            <Entry
                theme={this.props.theme}
                label={this.props.route.label}
                pathname={this.getPathname()}
                ServiceMonitorComponent={ServiceMonitor}
                children={this.props.children}
            />
        );
    }
}

Index.propTypes = {
    theme: React.PropTypes.object,
    children: React.PropTypes.node,
    route: React.PropTypes.object.isRequired
};

export default Index;
export { MonitorPage };
