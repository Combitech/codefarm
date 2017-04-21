import moment from "moment";
import React from "react";
import { Row, Col } from "react-flexbox-grid";
import { Card, CardText } from "react-toolbox/lib/card";
import Switch from "react-toolbox/lib/switch";
import Input from "react-toolbox/lib/input";
import Cytoscape from "./Cytoscape";
import LightComponent from "ui-lib/light_component";
import NodeInfoCard from "./NodeInfoCard";
import STATE from "../../../../lib/types/service_state";

const LINK_STATE = {
    INACTIVE: "INACTIVE",
    UNSTABLE: "UNSTABLE",
    INITIATED: "INITIATED",
    ALIVE: "ALIVE"
};

const HIDE_INTERACTION_IN_SECONDS = 120;
const LINK_OPACITY_MIN = 0.4;

const buildGraph = (services, maxAge = 0) => {
    const g = {
        nodes: [],
        links: []
    };

    if (services) {
        const oldestShown = (maxAge && maxAge > 0) ? moment().subtract(maxAge, "s") : false;
        for (const service of services) {
            const node = {
                id: service.id,
                label: `${service.name}`,
                state: service.state,
                service: service
            };
            g.nodes.push(node);

            // Add explicit dependencies
            for (const useKey of Object.keys(service.uses)) {
                const use = service.uses[useKey];
                // Add link if it doesn't already exist.
                const existingLinks = g.links.filter(
                    (l) => l.source === node && l.target === use.name
                );
                if (existingLinks.length === 0) {
                    g.links.push({
                        source: node,
                        target: use.name,
                        isExplicit: true,
                        isStrong: use.dependencyType === "need",
                        linkState: LINK_STATE.INACTIVE
                    });
                }
            }

            // Implicit dependencies (communication interactions)
            if (service.status) {
                for (const serviceKey of Object.keys(service.status)) {
                    const serviceStatus = service.status[serviceKey];
                    let linkState = LINK_STATE.INACTIVE;
                    let linkLastEvent;
                    const considerProp = (propName) =>
                        serviceStatus[propName] &&
                        serviceStatus[propName] > 0 &&
                        (!oldestShown || oldestShown.isSameOrAfter(serviceStatus[`${propName}.modified`]));
                    if (considerProp("requestsSent")) {
                        linkState = LINK_STATE.INITIATED;
                        linkLastEvent = serviceStatus["requestsSent.modified"];
                    }
                    let lastOkResponse;
                    if (considerProp("responsesOk")) {
                        linkState = LINK_STATE.ALIVE;
                        linkLastEvent = serviceStatus["responsesOk.modified"];
                        lastOkResponse = linkLastEvent;
                    }
                    // Do not set unstable if successfull response after
                    // set unstable
                    if (considerProp("timeouts")) {
                        const lastErrorTime = serviceStatus["timeouts.modified"];
                        if (!lastOkResponse || moment(lastErrorTime).isAfter(lastOkResponse)) {
                            linkState = LINK_STATE.UNSTABLE;
                            linkLastEvent = lastErrorTime;
                        }
                    }
                    if (considerProp("responsesNotOk")) {
                        const lastErrorTime = serviceStatus["responsesNotOk.modified"];
                        if (!lastOkResponse || moment(lastErrorTime).isAfter(lastOkResponse)) {
                            linkState = LINK_STATE.UNSTABLE;
                            linkLastEvent = lastErrorTime;
                        }
                    }

                    const existingLinks = g.links.filter(
                        (l) => l.source === node && l.target === serviceKey
                    );
                    if (existingLinks.length === 0) {
                        g.links.push({
                            source: node,
                            target: serviceKey,
                            linkState: linkState,
                            isRecent: true,
                            isExplicit: false,
                            linkLastEvent: linkLastEvent
                        });
                    } else {
                        existingLinks.forEach((l) => {
                            l.linkState = linkState;
                            l.linkLastEvent = linkLastEvent;
                        });
                    }
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

class NodeGraphCyto extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            serviceInfo: [],
            showExplicitDeps: false,
            maxAge: ""
        };
    }

    showServiceInfo(service) {
        this.setState((prevState) => {
            const services = prevState.serviceInfo;
            if (services.indexOf(service) === -1) {
                services.push(service);

                return { serviceInfo: services.slice(0) };
            }

            return {};
        });
    }

    hideServiceInfo(service) {
        this.setState((prevState) => {
            const services = prevState.serviceInfo;
            const index = services.indexOf(service);
            if (index !== -1) {
                services.splice(index, 1);

                return { serviceInfo: services.slice(0) };
            }

            return {};
        });
    }

    unselectServiceNode(service) {
        // Unselect element...
        const elems = this.cyGraph.getCy().elements(`node#${service.id}`);
        if (elems.length === 1 && elems[0].selected()) {
            elems.unselect();
        }
    }

    nodeEventHandler(serviceHandler, event) {
        const nodeId = event.target.id();
        const service = this.props.services.filter((service) => service.id === nodeId)[0];
        if (service) {
            serviceHandler(service);
        } else {
            this.error(`nodeEventHandler: Service ${nodeId} not found`, event);
        }
    }

    componentDidMount() {
        this.cyGraph.getCy().on("select", "node",
            this.nodeEventHandler.bind(this, this.showServiceInfo.bind(this)));
        this.cyGraph.getCy().on("unselect", "node",
            this.nodeEventHandler.bind(this, this.hideServiceInfo.bind(this)));
    }

    render() {
        const stateColor = this.props.stateColors;
        const graph = buildGraph(this.props.services, this.state.maxAge);

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

        const showExplicitDepsOnly = this.state.showExplicitDeps;
        const links = graph.links.filter((l) => {
            if (showExplicitDepsOnly) {
                return l.isExplicit;
            }

            return l.linkState !== LINK_STATE.INACTIVE;
        });
        for (const link of links) {
            let lineStyle = "solid";
            let lineOpacity = 1.0;
            let lineWidth = 4;
            let lineColor = stateColor[LINK_STATE.INACTIVE];

            if (showExplicitDepsOnly) {
                lineStyle = link.isStrong ? "solid" : "dashed";
                lineWidth = link.isStrong ? 4 : 2;
            } else {
                lineColor = stateColor[link.linkState];
                const eventAge = moment().diff(link.linkLastEvent, "seconds");
                lineOpacity = 1.0 - (eventAge / HIDE_INTERACTION_IN_SECONDS);
                lineOpacity = Math.max(lineOpacity, LINK_OPACITY_MIN);
            }
            elements.push({
                group: "edges",
                data: {
                    id: `${link.source.id}->${link.target.id}`,
                    source: link.source.id,
                    target: link.target.id,
                    classes: "bezier",
                    color: lineColor,
                    lineStyle: lineStyle,
                    width: lineWidth,
                    opacity: lineOpacity
                }
            });
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
                                    <Col md={6}>
                                        <Switch
                                            label="Show explicit dependencies"
                                            checked={this.state.showExplicitDeps}
                                            onChange={(showExplicitDeps) => this.setState({ showExplicitDeps })}
                                        />
                                    </Col>
                                    <Col md={6}>
                                        {!this.state.showExplicitDeps &&
                                            <Input
                                                type="number"
                                                label="Hide interactions older than"
                                                hint="Seconds"
                                                value={this.state.maxAge}
                                                onChange={(maxAge) => this.setState({ maxAge })}
                                            />
                                        }
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
                        {this.state.serviceInfo.map((service) => (
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
