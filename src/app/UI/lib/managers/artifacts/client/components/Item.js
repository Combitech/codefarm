
/* global window */

import React from "react";
import PropTypes from "prop-types";
import api from "api.io/api.io-client";
import LightComponent from "ui-lib/light_component";
import { Follow } from "ui-components/follow";
import { Container } from "ui-components/layout";
import {
    Section as TASection,
    MenuItem
} from "ui-components/type_admin";
import Notification from "ui-observables/notification";

class Item extends LightComponent {
    async onDownload(item) {
        const url = `/artifactrepo/artifact/${item._id}/download`;
        console.log(`Download from ${url}`);
        window.open(url);
    }

    async onValidate(item) {
        try {
            const data = await api.rest.action(
                "artifactrepo.artifact",
                item._id,
                "validate"
            );

            const hashResults = data.validation;
            const hashAlgs = Object.keys(hashResults);
            console.log(`artifact ${item._id} validation result`, hashResults);

            if (hashAlgs.length === 0) {
                throw new Error("No hashing algorithms configured!");
            }
            let allOk = true;
            for (const alg of hashAlgs) {
                const hashOk = hashResults[alg];
                if (!hashOk) {
                    allOk = false;
                }
            }
            if (allOk) {
                Notification.instance.publish("Artifact valid");
            } else {
                Notification.instance.publish("Artifact not valid!", "warning");
            }
        } catch (error) {
            Notification.instance.publish(`Failed to validate artifact: ${error.message || error}`, "warning");
        }
    }

    render() {
        this.log("render", this.props, this.state);

        const menuItems = this.props.menuItems.slice(0);
        menuItems.push((
            <MenuItem
                key="download"
                caption="Download"
                onClick={() => this.onDownload(this.props.item)}
                disabled={this.props.item.state === "committed"}
            />
        ));

        menuItems.push((
            <MenuItem
                key="validate"
                caption="Validate"
                onClick={() => this.onValidate(this.props.item)}
                disabled={this.props.item.state === "committed"}
            />
        ));

        return (
            <TASection
                controls={this.props.controls}
                breadcrumbs={this.props.breadcrumbs}
                menuItems={menuItems}
            >
                <Container>
                    <Follow
                        item={this.props.item}
                        pathname={this.props.pathname}
                        label="Artifact"
                    />
                </Container>
            </TASection>
        );
    }
}

Item.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    pathname: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    menuItems: PropTypes.array.isRequired
};

export default Item;
