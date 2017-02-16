
import React from "react";
import Chip from "react-toolbox/lib/chip";
import Snackbar from "react-toolbox/lib/snackbar";
import Component from "ui-lib/component";
import { Row, Col } from "react-flexbox-grid";
// Re-use job-list-item component from job section
import JobListItem from "../job/ListItem";
import {
    Section as TASection,
    List as TAList,
    ControlButton as TAControlButton
} from "ui-components/type_admin";
import api from "api.io/api.io-client";
import * as pathBuilder from "ui-lib/path_builder";

class Item extends Component {
    constructor(props) {
        super(props);
        this.addStateVariable("statusMessage", { msg: "", type: "accept" });
    }

    _showMessage(msg, type = "accept") {
        this.state.statusMessage.set({ msg: msg, type: type });
    }

    _closeSnackbar() {
        this._showMessage("");
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
                                {this.props.item.tags.map((tag) => (
                                    <Chip key={tag}>{tag}</Chip>
                                ))}
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
                            <TAList
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
                            <TAList
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
                            <TAList
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
                    <Snackbar
                        action="Dismiss"
                        active={this.state.statusMessage.value.msg.length > 0}
                        label={this.state.statusMessage.value.msg}
                        timeout={5000}
                        onClick={this._closeSnackbar.bind(this)}
                        onTimeout={this._closeSnackbar.bind(this)}
                        type={this.state.statusMessage.value.type}
                    />
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
