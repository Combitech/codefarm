import React from "react";
import { CardTitle, CardText, CardActions } from "react-toolbox/lib/card";
import { List, ListItem, ListDivider, ListSubHeader } from "react-toolbox/lib/list";
import Button from "react-toolbox/lib/button";
import Snackbar from "react-toolbox/lib/snackbar";
import Component from "ui-lib/component";
import ExpandableCard from "ui-components/expandable_card";
import ConfigDialog from "./ConfigDialog";
import STATE from "../../../../lib/types/service_state";

class NodeInfoCard extends Component {
    constructor(props) {
        super(props);

        this.addStateVariable("statusMessage", { msg: "", type: "accept" });
        this.addStateVariable("configDialogOpen", false);
        this.addStateVariable("currentConfig", {});
        this.addStateVariable("expanded", false);
    }

    showMessage(msg, type = "accept") {
        this.state.statusMessage.set({ msg: msg, type: type });
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
        this.state.currentConfig.set(activeConfig);
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

        return (
            <div>
                <ExpandableCard expanded={this.state.expanded}>
                    <CardTitle
                        title={title}
                        subtitle={subtitle}
                    />
                    {this.state.expanded.value && service &&
                        <div>
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
                            </List>
                        </div>
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
                    configData={this.state.currentConfig.value}
                />
                <Snackbar
                    action="Dismiss"
                    active={this.state.statusMessage.value.msg.length > 0}
                    label={this.state.statusMessage.value.msg}
                    timeout={3000}
                    onClick={this.closeSnackbar.bind(this)}
                    onTimeout={this.closeSnackbar.bind(this)}
                    type={this.state.statusMessage.value.type}
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
