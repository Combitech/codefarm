import React from "react";
import { CardTitle, CardText, CardActions } from "react-toolbox/lib/card";
import { List, ListItem, ListDivider, ListSubHeader } from "react-toolbox/lib/list";
import Button from "react-toolbox/lib/button";
import Snackbar from "react-toolbox/lib/snackbar";
import LightComponent from "ui-lib/light_component";
import ExpandableCard from "ui-components/expandable_card";
import ConfigDialog from "./ConfigDialog";
import stateVar from "ui-lib/state_var";
import STATE from "../../../../lib/types/service_state";

class NodeInfoCard extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            statusMessage: { msg: "", type: "accept" },
            configDialogOpen: stateVar(this, "configDialogOpen", false),
            currentConfig: {},
            expanded: stateVar(this, "expanded", false)
        };
    }

    showMessage(msg, type = "accept") {
        this.setState({ statusMessage: { msg: msg, type: type } });
    }

    async restartService() {
        const serviceId = this.props.service.id;
        console.log(`Restart service ${serviceId}`);
        const data = await this.props.service.restart();
        const serviceName = data.name;
        this.showMessage(`Service ${serviceName} restarted`);
        console.log("Restart response", data);
    }

    async showServiceConfig() {
        const serviceId = this.props.service.id;
        console.log(`Show service config ${serviceId}`);
        const activeConfig = await this.props.service.getActiveConfig();
        this.setState({ currentConfig: activeConfig });
        console.log(`Active config for ${serviceId}`, activeConfig);

        if (activeConfig && activeConfig.length === 1) {
            this.showMessage(`Got active config for ${serviceId}`);
            this.state.configDialogOpen.set(true);
        } else {
            this.showMessage(`Error requesting active config for ${serviceId}`);
        }
    }

    closeSnackbar() {
        this.showMessage("");
    }

    render() {
        const title = this.props.service ? this.props.service.id : "";
        const isReady = this.props.service.state !== STATE.NOT_CREATED;
        const subtitle = this.props.service ? this.props.service.state : "";
        const service = this.props.service || false;

        const useList = Object.keys(service.uses).map((key) => service.uses[key]);
        const needList = useList.filter((use) => use.dependencyType === "need");
        const wantList = useList.filter((use) => use.dependencyType === "want");

        const serviceStatus = [];
        if (service && service.status) {
            for (const serviceKey of Object.keys(service.status)) {
                serviceStatus.push(Object.assign(
                    { serviceName: serviceKey },
                    service.status[serviceKey]
                ));
            }
        }
        const warnings = serviceStatus.filter((item) => item.timeouts > 0 || item.responsesNotOk > 0);

        return (
            <div>
                <ExpandableCard expanded={this.state.expanded}>
                    <CardTitle
                        title={title}
                        subtitle={subtitle}
                    />
                    {warnings.length > 0 &&
                        <List>
                            <ListSubHeader
                                caption={"Warnings"}
                            />
                            {warnings.map((item) => (
                                <div key={item.serviceName}>
                                    {item.timeouts && item.timeouts > 0 &&
                                        <ListItem
                                            caption={`${item.timeouts} timeouts`}
                                            legend={`when communicating with ${item.serviceName}`}
                                        />
                                    }
                                    {item.responsesNotOk && item.responsesNotOk > 0 &&
                                        <ListItem
                                            caption={`${item.responsesNotOk} failed responses`}
                                            legend={`when communicating with ${item.serviceName}`}
                                        />
                                    }
                                </div>
                            ))}
                        </List>
                    }
                    {this.state.expanded.value && service &&
                        <List>
                            <ListSubHeader
                                caption={"Provides"}
                            />
                            {Object.keys(service.provides).map((provideKey) =>
                                <ListItem
                                    key={provideKey}
                                    caption={`${provideKey}`} />
                            )}
                            <ListDivider />
                            <ListSubHeader
                                caption={"Needs"}
                            />
                            {needList.map((use, index) => (
                                <ListItem
                                    key={index}
                                    caption={`${use.type} service from ${use.name}`}
                                    legend={`Observed state is ${use.state}`} />
                            ))}
                            <ListSubHeader
                                caption={"Wants"}
                            />
                            {wantList.map((use, index) => (
                                <ListItem
                                    key={index}
                                    caption={`${use.type} service from ${use.name}`}
                                    legend={`Observed state is ${use.state}`} />
                            ))}
                            <ListDivider />
                            {serviceStatus.map((item) =>
                                <div key={item.serviceName}>
                                    <ListSubHeader
                                        caption={`Statistics communicating with ${item.serviceName}`}
                                    />
                                    {item.requestsSent && item.requestsSent > 0 &&
                                        <ListItem
                                            caption={`${item.requestsSent || 0} requests sent`}
                                        />
                                    }
                                    {item.responsesOk && item.responsesOk > 0 &&
                                        <ListItem
                                            caption={`${item.responsesOk || 0} successfull responses`}
                                        />
                                    }
                                    {item.responsesNotOk && item.responsesNotOk > 0 &&
                                        <ListItem
                                            caption={`${item.responsesNotOk || 0} failed responses`}
                                        />
                                    }
                                    {item.timeouts && item.timeouts > 0 &&
                                        <ListItem
                                            caption={`${item.timeouts || 0} timeouts`}
                                        />
                                    }
                                </div>
                            )}
                        </List>
                    }
                    {isReady &&
                        <CardActions>
                            <Button label="Restart" onClick={this.restartService.bind(this)}/>
                            <Button label="Config" onClick={this.showServiceConfig.bind(this)}/>
                            {this.props.onClose &&
                                <Button label="Close" onClick={this.props.onClose} />
                            }
                        </CardActions>
                    }
                    {!isReady &&
                        <CardText>
                            Service info not yet received...
                        </CardText>
                    }
                </ExpandableCard>
                <ConfigDialog
                    open={this.state.configDialogOpen}
                    titleText={"Active service config"}
                    configData={this.state.currentConfig}
                />
                <Snackbar
                    action="Dismiss"
                    active={this.state.statusMessage.msg.length > 0}
                    label={this.state.statusMessage.msg}
                    timeout={3000}
                    onClick={this.closeSnackbar.bind(this)}
                    onTimeout={this.closeSnackbar.bind(this)}
                    type={this.state.statusMessage.type}
                />
            </div>
        );
    }
}

NodeInfoCard.propTypes = {
    service: React.PropTypes.object,
    onClose: React.PropTypes.func
};

export default NodeInfoCard;
