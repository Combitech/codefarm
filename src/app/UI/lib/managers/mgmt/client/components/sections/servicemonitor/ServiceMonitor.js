import React from "react";
import ServiceMonitorTable from "./ServiceMonitorTable";
import NodeGraphCyto from "./NodeGraphCyto";
import Component from "ui-lib/component";
import stateColors from "./state_colors";
import ServiceMonitorLib from "../../../lib/service_monitor";

const VIEW_TYPE = {
    GRAPH: "graph",
    TABLE: "table"
};


class ServiceMonitor extends Component {
    constructor(props) {
        super(props);
        this.addStateVariable("serviceInfo", []);
        this.addStateVariable("view", VIEW_TYPE.NODE_GRAPH);
    }

    serviceInfoListener(info) {
        this.state.serviceInfo.set(info);
    }

    async componentDidMountAsync() {
        this.serviceSubscription = ServiceMonitorLib.instance.addServiceInfoListener(
            this.serviceInfoListener.bind(this)
        );
    }

    async componentWillUnmountAsync() {
        if (this.serviceSubscription) {
            this.serviceSubscription.dispose();
            this.serviceSubscription = null;
        }
    }

    render() {
        console.log("ServiceMonitor-RENDER");
        const services = this.state.serviceInfo.value;

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
    theme: React.PropTypes.object,
    view: React.PropTypes.oneOf([ VIEW_TYPE.GRAPH, VIEW_TYPE.TABLE ]).isRequired
};

export default ServiceMonitor;
