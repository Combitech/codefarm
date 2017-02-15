
/* global window */

import React from "react";
import Snackbar from "react-toolbox/lib/snackbar";
import Chip from "react-toolbox/lib/chip";
import { Row, Col } from "react-flexbox-grid";
import Component from "ui-lib/component";
import api from "api.io/api.io-client";
import { Flows } from "ui-components/flow";
import Flow from "./Flow";
import {
    Section as TASection,
    LoadIndicator as TALoadIndicator,
    ControlButton as TAControlButton
} from "ui-components/type_admin";
import * as queryBuilder from "ui-lib/query_builder";
import { StringUtil } from "misc";

class Item extends Component {
    constructor(props) {
        super(props);
        this.addStateVariable("statusMessage", { msg: "", type: "accept" });
        this.addStateVariable("step", "");

        this.addTypeItemStateVariableWithCreate("itemExt", "dataresolve.data", (props) => {
            return {
                resolver: "RefResolve",
                opts: {
                    ref: {
                        id: props.item._id,
                        type: props.item.type
                    },
                    spec: {
                        paths: [
                            "$.refs[*]"
                        ]
                    }
                }
            };
        }, true);

        this.addTypeListStateVariable("flows", "flowctrl.flow", (props) => {
            const flows = props.item.tags
                .filter((tag) => tag.startsWith("step:flow:"))
                .map((tag) => tag.replace("step:flow:", ""));

            return queryBuilder.anyOf("_id", flows);
        }, true);
    }

    _showMessage(msg, type = "accept") {
        this.state.statusMessage.set({ msg: msg, type: type });
    }

    _closeSnackbar() {
        this._showMessage("");
    }

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
        const response = await api.rest.get(
            "artifactrepo.artifact",
            item._id,
            "validate"
        );
        if (response.result === "success") {
            const hashResults = response.data.validation;
            const hashAlgs = Object.keys(hashResults);
            if (hashAlgs.length > 0) {
                let allOk = true;
                for (const alg of hashAlgs) {
                    const hashOk = hashResults[alg];
                    if (!hashOk) {
                        allOk = false;
                    }
                }
                if (allOk) {
                    this._showMessage("Artifact valid");
                } else {
                    this._showMessage("Artifact not valid!", "warning");
                }
            } else {
                this._showMessage("Couldn't validate, no algorithms configured!");
            }
            console.log(`artifact ${item._id} validation result`, hashResults);
        } else {
            console.error("_validate: Couldn't validate artifact, response=", response);
        }
    }

    render() {
        this.log("render", this.props);

        if (this.state.errorAsync.value) {
            return (
                <div>{this.state.errorAsync.value}</div>
            );
        }

        let loadIndicator;
        if (this.state.loadingAsync.value) {
            loadIndicator = (
                <TALoadIndicator
                    theme={this.props.theme}
                />
            );
        }

        const hasFile = this.props.item.state === "commited";

        let stateStr = "No file uploaded";
        if (hasFile) {
            stateStr = "File uploaded";
        }

        const controls = this.props.controls.slice(0);
        controls.push((
            <TAControlButton
                key="download"
                label="Download"
                onClick={() => this.onDownload(this.props.item)}
                disabled={!hasFile}
            />
        ));

        controls.push((
            <TAControlButton
                key="validate"
                label="Validate"
                onClick={() => this.onValidate(this.props.item)}
                disabled={!hasFile}
            />
        ));

        const flows = this.state.flows ? this.state.flows : [];

        return (
            <div>
                {loadIndicator}
                <TASection
                    controls={controls}
                    breadcrumbs={this.props.breadcrumbs}
                >
                    <div className={this.props.theme.container}>
                        {this.state.itemExt &&
                            <Flows
                                theme={this.props.theme}
                                item={this.props.item}
                                itemExt={this.state.itemExt}
                                pathname={this.props.pathname}
                                step={this.state.step}
                                flows={flows}
                                FlowComponent={Flow}
                            />
                        }
                        {this.state.step.value ? (
                            <Row>
                                {`Selected ${this.state.step.value}`}
                            </Row>
                        ) : (
                            <div>
                                <Row>
                                    <Col className={this.props.theme.panel}>
                                        <div className={this.props.theme.tags}>
                                            {this.props.item.tags.map((tag) => (
                                                <Chip key={tag}>{tag}</Chip>
                                            ))}
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12} md={5} className={this.props.theme.panel}>
                                        <h6 className={this.props.theme.title}>Properties</h6>
                                        <table className={this.props.theme.properties}>
                                            <tbody>
                                                <tr>
                                                    <td>Name</td>
                                                    <td>{this.props.item.name}</td>
                                                </tr>
                                                <tr>
                                                    <td>Version</td>
                                                    <td>{this.props.item.version}</td>
                                                </tr>
                                                <tr>
                                                    <td>State</td>
                                                    <td>{stateStr}</td>
                                                </tr>
                                                <tr>
                                                    <td>Created</td>
                                                    <td>{this.props.item.created}</td>
                                                </tr>
                                                <tr>
                                                    <td>Modified</td>
                                                    <td>{this.props.item.saved}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </Col>
                                    {hasFile &&
                                        <Col xs={12} md={7} className={this.props.theme.panel}>
                                            <h6 className={this.props.theme.title}>File info</h6>
                                            <table className={this.props.theme.properties}>
                                                <tbody>
                                                    <tr>
                                                        <td>File name</td>
                                                        <td>{this.props.item.fileMeta.filename}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>MIME type</td>
                                                        <td>{this.props.item.fileMeta.mimeType}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Size</td>
                                                        <td>{this.props.item.fileMeta.size} bytes</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <h6 className={this.props.theme.title}>Hashes</h6>
                                            <table className={this.props.theme.properties}>
                                                <tbody>
                                                    {Object.keys(this.props.item.fileMeta.hashes).map((hashAlg) => (
                                                        <tr key={hashAlg}>
                                                            <td>{StringUtil.toUpperCaseLetter(hashAlg)}</td>
                                                            <td>{this.props.item.fileMeta.hashes[hashAlg]}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </Col>
                                    }
                                </Row>
                            </div>
                        )}
                    </div>
                </TASection>
                <Snackbar
                    action="Dismiss"
                    active={this.state.statusMessage.value.msg.length > 0}
                    label={this.state.statusMessage.value.msg}
                    timeout={3000}
                    onClick={this._closeSnackbar.bind(this)}
                    onTimeout={this._closeSnackbar.bind(this)}
                    type={this.state.statusMessage.value.type}
                />
            </div>
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
