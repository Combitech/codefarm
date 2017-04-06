
import React from "react";
import LightComponent from "ui-lib/light_component";
import { IconMenu, MenuItem } from "react-toolbox/lib/menu";
import { SlaveView } from "ui-components/data_view";
import {
    Section as TASection
} from "ui-components/type_admin";
import api from "api.io/api.io-client";
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
        let errorMsg;
        try {
            const res = await api.rest.action("exec.slave", id, "verify");
            if (res.ok) {
                this._showMessage("Slave connection test OK");
            } else {
                errorMsg = `Slave connection test failed with message "${res.msg}"`;
            }
            console.log(`Slave ${id} test connection result`, res);
        } catch (error) {
            console.error(`Slave ${id} test connection failed with error`, error);
            errorMsg = `Slave connection test failed with message "${error.message || error}"`;
        }
        if (errorMsg) {
            this._showMessage(errorMsg, "warning");
        }
    }

    async onSetOfflineOnline() {
        const id = this.props.item._id;
        const setOnline = this.props.item.offline;
        const res = await api.rest.action("exec.slave", id, "setonline", {
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

        const isSignedIn = !!this.props.activeUser.get("id");

        const controls = [];

        controls.push((
            <IconMenu
                key="menu"
                className={this.props.theme.button}
                icon="more_vert"
                menuRipple={true}
            >
                <If condition={isSignedIn}>
                    <MenuItem
                        caption="Edit tags"
                        onClick={() => this.context.router.push({
                            pathname: `${this.props.pathname}/tags`
                        })}
                    />

                    <MenuItem
                        caption={this.props.item.offline ? "Set Online" : "Set Offline"}
                        onClick={() => this.onSetOfflineOnline()}
                    />

                    <MenuItem
                        caption="Test connection"
                        onClick={() => this.onTestConnection()}
                    />
                </If>
            </IconMenu>
        ));

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <div className={this.props.theme.container}>
                    <SlaveView
                        item={this.props.item}
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
