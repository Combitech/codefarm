
import React from "react";
import Tags from "ui-components/tags";
import LightComponent from "ui-lib/light_component";
import { Row, Col } from "react-flexbox-grid";
// Re-use job-list-item component from job section
import JobListItem from "../job/ListItem";
import {
    Section as TASection,
    PagedList as TAPagedList,
    ControlButton as TAControlButton
} from "ui-components/type_admin";
import api from "api.io/api.io-client";
import * as pathBuilder from "ui-lib/path_builder";
import Notification from "ui-observables/notification";

class Item extends LightComponent {
    constructor(props) {
        super(props);
    }

    _showMessage(msg, type = "accept") {
        Notification.instance.publish(msg, type);
    }

    async onTestConnection() {
        const id = this.props.item._id;
        const res = await api.type.action("exec.slave", id, "verify");

        if (res.ok) {
            this._showMessage("Slave connection test OK");
        } else {
            this._showMessage(`Slave connection test failed with message "${res.msg}"`, "warning");
        }
        console.log(`Slave ${id} test connection result`, res);
    }

    async onSetOfflineOnline() {
        const id = this.props.item._id;
        const setOnline = this.props.item.offline;
        const res = await api.type.action("exec.slave", id, "setOnline", {
            online: setOnline
        });

        const slaveNowOnline = !res.offline;
        const newStatus = slaveNowOnline ? "online" : "offline";
        if (slaveNowOnline === setOnline) {
            this._showMessage(`Slave now ${newStatus}`);
        } else {
            this._showMessage(`Slave still ${newStatus}`, "warning");
        }
        console.log(`Slave ${id} setOnline result`, res);
    }

    render() {
        this.log("render", this.props, this.state);

        const controls = this.props.controls.slice(0);

        controls.push((
            <TAControlButton
                key="onlineoffline"
                label={this.props.item.offline ? "Set Online" : "Set Offline"}
                onClick={() => this.onSetOfflineOnline()}
            />
        ));

        controls.push((
            <TAControlButton
                key="test"
                label="Test connection"
                onClick={() => this.onTestConnection()}
            />
        ));

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <div className={this.props.theme.container}>
                    <Row>
                        <Col xs={12} md={5} className={this.props.theme.panel}>
                            <div className={this.props.theme.tags}>
                                <Tags list={this.props.item.tags} />
                            </div>
                            <h6 className={this.props.theme.title}>Properties</h6>
                            <table className={this.props.theme.properties}>
                                <tbody>
                                    <tr>
                                        <td>URI</td>
                                        <td className={this.props.theme.monospace}>{this.props.item.uri}</td>
                                    </tr>
                                    <tr>
                                        <td>Executors</td>
                                        <td>{this.props.item.executors}</td>
                                    </tr>
                                    <tr>
                                        <td>Private Key</td>
                                        <td className={this.props.theme.monospace}>{this.props.item.privateKeyPath}</td>
                                    </tr>
                                    <tr>
                                        <td>Created</td>
                                        <td>{this.props.item.created}</td>
                                    </tr>
                                    <tr>
                                        <td>Saved</td>
                                        <td>{this.props.item.saved}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Col>
                        <Col xs={12} md={7} className={this.props.theme.panel}>
                            <h6 className={this.props.theme.title}>Allocated jobs</h6>
                            <TAPagedList
                                type="exec.job"
                                query={{ slaveId: this.props.item._id, status: "allocated" }}
                                onSelect={(item) => {
                                    this.context.router.push({
                                        pathname: pathBuilder.fromType("exec.job", item)
                                    });
                                }}
                                ListItemComponent={JobListItem}
                            />
                            <h6 className={this.props.theme.title}>Running jobs</h6>
                            <TAPagedList
                                type="exec.job"
                                query={{ slaveId: this.props.item._id, status: "ongoing" }}
                                onSelect={(item) => {
                                    this.context.router.push({
                                        pathname: pathBuilder.fromType("exec.job", item)
                                    });
                                }}
                                ListItemComponent={JobListItem}
                            />
                            <h6 className={this.props.theme.title}>Finished jobs</h6>
                            <TAPagedList
                                type="exec.job"
                                query={{ slaveId: this.props.item._id, status: { $nin: [ "queued", "allocated", "ongoing" ] } }}
                                onSelect={(item) => {
                                    this.context.router.push({
                                        pathname: pathBuilder.fromType("exec.job", item)
                                    });
                                }}
                                ListItemComponent={JobListItem}
                            />
                        </Col>
                    </Row>
                </div>
            </TASection>
        );
    }
}

Item.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

Item.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default Item;
