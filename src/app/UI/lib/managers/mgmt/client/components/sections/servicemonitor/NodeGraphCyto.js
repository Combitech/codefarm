import React from "react";
import { Row, Col } from "react-flexbox-grid";
import { Card, CardText } from "react-toolbox/lib/card";
import Switch from "react-toolbox/lib/switch";
import Cytoscape from "./Cytoscape";
import Component from "ui-lib/component";
import NodeInfoCard from "./NodeInfoCard";
import STATE from "../../../../lib/types/service_state";

const buildGraph = (services) => {
    const g = {
        nodes: [],
        links: []
    };

    if (services) {
        for (const service of services) {
            const node = {
                id: service.id,
                label: `${service.name}`,
                state: service.state,
                service: service
            };
            g.nodes.push(node);
            for (const useKey of Object.keys(service.uses)) {
                const use = service.uses[useKey];
                // Add link if it doesn't already exist.
                const existingLinks = g.links.filter(
                    (l) => l.source === node && l.target === use.name && l.state === use.state
                );
                if (existingLinks.length === 0) {
                    g.links.push({
                        source: node,
                        target: use.name,
                        state: use.state,
                        isStrong: use.dependencyType === "need"
                    });
                }
            }
        }

        // Create temporary nodes for target links not notified yet...
        for (const l of g.links) {
            const targetId = l.target;
            let node = g.nodes.filter((n) => n.id === targetId)[0];
            if (!node) {
                node = {
                    id: targetId,
                    label: targetId,
                    state: STATE.NOT_CREATED
                };
                g.nodes.push(node);
            }
            l.target = node;
        }
    }

    return g;
};

class NodeGraphCyto extends Component {
    constructor(props) {
        super(props);
        this.addStateVariable("serviceInfo", []);
        this.addStateVariable("showWeakDeps", false);
    }

    showServiceInfo(service) {
        const services = this.state.serviceInfo.value;
        if (services.indexOf(service) === -1) {
            services.push(service);
            this.state.serviceInfo.set(services.slice(0));
        }
    }

    hideServiceInfo(service) {
        const services = this.state.serviceInfo.value;
        const index = services.indexOf(service);
        if (index !== -1) {
            services.splice(index, 1);
            this.state.serviceInfo.set(services.slice(0));
        }
    }

    unselectServiceNode(service) {
        // Unselect element...
        const elems = this.cyGraph.getCy().elements(`node#${service.id}`);
        if (elems.length === 1 && elems[0].selected()) {
            elems.unselect();
        }
    }

    nodeEventHandler(serviceHandler, event) {
        const nodeId = event.cyTarget.id();
        const service = this.props.services.filter((service) => service.id === nodeId)[0];
        if (service) {
            serviceHandler(service);
        } else {
            console.error(`nodeEventHandler: Service ${nodeId} not found`, event);
        }
    }

    async componentDidMountAsync() {
        this.cyGraph.getCy().on("select", "node",
            this.nodeEventHandler.bind(this, this.showServiceInfo.bind(this)));
        this.cyGraph.getCy().on("unselect", "node",
            this.nodeEventHandler.bind(this, this.hideServiceInfo.bind(this)));
    }

    render() {
        const stateColor = this.props.stateColors;
        const graph = buildGraph(this.props.services);

        const elements = [];
        for (const node of graph.nodes) {
            elements.push({
                group: "nodes",
                data: {
                    id: node.id,
                    type: "bezier",
                    color: stateColor[node.state],
                    classes: "bezier"
                },
                grabbable: false, // No moving around...
                selectable: !!node.service
            });
        }

        for (const link of graph.links) {
            if (link.isStrong || this.state.showWeakDeps.value) {
                elements.push({
                    group: "edges",
                    data: {
                        id: `${link.source.id}->${link.target.id}`,
                        source: link.source.id,
                        target: link.target.id,
                        classes: "bezier",
                        color: stateColor[link.state],
                        lineStyle: link.isStrong ? "solid" : "dashed",
                        width: link.isStrong ? 4 : 2
                    }
                });
            }
        }

        const graphColWidths = {
            xs: 12,
            sm: 8,
            md: 7,
            lg: 6
        };

        const infoColWidths = {};
        for (const sizeKey of Object.keys(graphColWidths)) {
            infoColWidths[sizeKey] = 12 - graphColWidths[sizeKey];
        }

        return (
            <div className={this.props.theme.nodeGraph}>
                <Row>
                    <Col xs={graphColWidths.xs} sm={graphColWidths.sm} md={graphColWidths.md} lg={graphColWidths.lg}>
                        <Card>
                            <CardText>
                                <Row>
                                    <Col xs={12}>
                                        <Switch
                                            label="Show weak dependencies"
                                            checked={this.state.showWeakDeps.value}
                                            onChange={this.state.showWeakDeps.toggle}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12}>
                                        <Cytoscape
                                            ref={(ref) => this.cyGraph = ref}
                                            elements={elements}
                                            width="100%"
                                            height="500px"
                                        />
                                    </Col>
                                </Row>
                            </CardText>
                        </Card>
                    </Col>
                    <Col xs={infoColWidths.xs} sm={infoColWidths.sm} md={infoColWidths.md} lg={infoColWidths.lg}>
                        <Row>
                        {this.state.serviceInfo.value.map((service) => (
                            <Col key={service.id} xs={12} sm={12} md={12} lg={6}>
                                <div key={service.id} className={this.props.theme.cellContainer}>
                                    <NodeInfoCard
                                        key={service.id}
                                        service={service}
                                        onClose={this.unselectServiceNode.bind(this, service)}
                                    />
                                </div>
                            </Col>
                        ))}
                        </Row>
                    </Col>
                </Row>
            </div>
        );
    }
}

NodeGraphCyto.propTypes = {
    services: React.PropTypes.array,
    stateColors: React.PropTypes.object.isRequired,
    theme: React.PropTypes.object
};

export default NodeGraphCyto;
