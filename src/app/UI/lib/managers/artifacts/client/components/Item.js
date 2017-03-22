
/* global window */

import React from "react";
import api from "api.io/api.io-client";
import LightComponent from "ui-lib/light_component";
import { Follow } from "ui-components/follow";
import { Container } from "ui-components/layout";
import {
    Section as TASection,
    ControlButton as TAControlButton
} from "ui-components/type_admin";
import Notification from "ui-observables/notification";

class Item extends LightComponent {
    async _getArtifactRepoRestUrl() {
        const response = await api.type.get("artifactrepo.state");

        if (response.length !== 1) {
            console.error("_getArtifactRepoRestUrl: Couldn't get artifactrepo rest uri, response=", response);

            return false;
        }

        return response[0].provides.REST.uri;
    }

    async onDownload(item) {
        const repoUrl = await this._getArtifactRepoRestUrl();
        if (repoUrl) {
            const url = `${repoUrl}/artifact/${item._id}/download`;
            console.log(`Download from ${url}`);

            // Ugly way of downloading file from javascript...
            window.location = url;
        }
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

        const controls = this.props.controls.slice(0);
        controls.push((
            <TAControlButton
                key="download"
                label="Download"
                onClick={() => this.onDownload(this.props.item)}
                disabled={this.props.item.state === "committed"}
            />
        ));

        controls.push((
            <TAControlButton
                key="validate"
                label="Validate"
                onClick={() => this.onValidate(this.props.item)}
                disabled={this.props.item.state === "committed"}
            />
        ));

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
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
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

export default Item;
