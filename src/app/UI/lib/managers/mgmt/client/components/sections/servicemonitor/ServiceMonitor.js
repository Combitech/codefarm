import React from "react";
import PropTypes from "prop-types";
import ServiceMonitorTable from "./ServiceMonitorTable";
import NodeGraphCyto from "./NodeGraphCyto";
import LightComponent from "ui-lib/light_component";
import stateColors from "./state_colors";
import ServiceMonitorLib from "../../../lib/service_monitor";

const VIEW_TYPE = {
    GRAPH: "graph",
    TABLE: "table"
};


class ServiceMonitor extends LightComponent {
    constructor(props) {
        super(props);
        this.state = {
            serviceInfo: []
        };
    }

    serviceInfoListener(serviceInfo) {
        this.setState({ serviceInfo });
    }

    componentDidMount() {
        this.serviceSubscription = ServiceMonitorLib.instance.addServiceInfoListener(
            this.serviceInfoListener.bind(this)
        );
    }

    componentWillUnmount() {
        if (this.serviceSubscription) {
            this.serviceSubscription.dispose();
            this.serviceSubscription = null;
        }
        super.componentWillUnmount();
    }

    render() {
        this.log("render", this.props);
        const services = this.state.serviceInfo;

        return (
            <div>
                {this.props.view === VIEW_TYPE.GRAPH &&
                    <NodeGraphCyto
                        services={services}
                        stateColors={stateColors}
                        theme={this.props.theme}
                    />
                }
                {this.props.view === VIEW_TYPE.TABLE &&
                    <ServiceMonitorTable
                        services={services}
                    />
                }
            </div>
        );
    }
}

ServiceMonitor.propTypes = {
    theme: PropTypes.object,
    view: PropTypes.oneOf([ VIEW_TYPE.GRAPH, VIEW_TYPE.TABLE ]).isRequired
};

export default ServiceMonitor;
