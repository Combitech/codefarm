
import React from "react";
import LightComponent from "ui-lib/light_component";
import Entry from "./Entry";
import ServiceMonitor from "./ServiceMonitor";

class Page extends LightComponent {
    render() {
        this.log("indexLocal-RENDER", this.props);

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

Page.propTypes = {
    theme: React.PropTypes.object,
    children: React.PropTypes.node,
    route: React.PropTypes.object.isRequired
};

export default Page;
