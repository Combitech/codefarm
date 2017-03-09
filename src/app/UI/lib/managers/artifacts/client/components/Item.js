
/* global window */

import React from "react";
import Chip from "react-toolbox/lib/chip";
import { Row, Col } from "react-flexbox-grid";
import LightComponent from "ui-lib/light_component";
import api from "api.io/api.io-client";
import { Flows } from "ui-components/flow";
import Flow from "./Flow";
import {
    Section as TASection,
    LoadIndicator as TALoadIndicator,
    ControlButton as TAControlButton
} from "ui-components/type_admin";
import { StringUtil } from "misc";
import ExtendedItem from "ui-observables/extended_item";
import FlowList from "ui-observables/flow_list";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import Notification from "ui-observables/notification";
import LocationQuery from "ui-observables/location_query";

class Item extends LightComponent {
    constructor(props) {
        super(props);

        this.itemExt = new ExtendedItem({
            id: props.item._id,
            type: props.item.type
        });

        this.flows = new FlowList({
            tags: props.item.tags
        });

        this.state = {
            params: LocationQuery.instance.params.getValue(),
            itemExt: this.itemExt.value.getValue(),
            itemExtState: this.itemExt.state.getValue(),
            flows: this.flows.value.getValue(),
            flowsState: this.flows.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.itemExt.start());
        this.addDisposable(this.flows.start());

        this.addDisposable(this.itemExt.value.subscribe((itemExt) => this.setState({ itemExt })));
        this.addDisposable(this.itemExt.state.subscribe((itemExtState) => this.setState({ itemExtState })));
        this.addDisposable(this.flows.value.subscribe((flows) => this.setState({ flows })));
        this.addDisposable(this.flows.state.subscribe((flowsState) => this.setState({ flowsState })));
        this.addDisposable(LocationQuery.instance.params.subscribe((params) => this.setState({ params })));
    }

    componentWillReceiveProps(nextProps) {
        this.itemExt.setOpts({
            id: nextProps.item._id,
            type: nextProps.item.type
        });

        this.flows.setOpts({
            tags: nextProps.item.tags
        });
    }

    _showMessage(msg, type = "accept") {
        Notification.instance.publish(msg, type);
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
        const data = await api.type.action(
            "artifactrepo.artifact",
            item._id,
            "validate"
        );

        const hashResults = data.validation;
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
    }

    render() {
        this.log("render", this.props);

        let loadIndicator;
        if (this.state.itemExtState === ObservableDataStates.LOADING || this.state.flowsState === ObservableDataStates.LOADING) {
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

        const flows = this.state.flows.toJS();
        const itemExt = this.state.itemExt.get("_id") ? this.state.itemExt.toJS() : false;
        const step = this.state.params.toJS().step || "";

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                {loadIndicator}
                {itemExt &&
                    <div className={this.props.theme.container}>
                        <Flows
                            theme={this.props.theme}
                            item={this.props.item}
                            itemExt={itemExt}
                            pathname={this.props.pathname}
                            step={step}
                            onStepSelect={(step) => LocationQuery.instance.setParams({ step })}
                            flows={flows}
                            FlowComponent={Flow}
                        />
                        {step ? (
                            <Row>
                                {`Selected ${step}`}
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
                }
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
