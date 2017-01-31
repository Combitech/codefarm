
/* global window */

import React from "react";
import Snackbar from "react-toolbox/lib/snackbar";
import Component from "ui-lib/component";
import Chip from "react-toolbox/lib/chip";
import Link from "react-toolbox/lib/link";
import { Tab, Tabs } from "react-toolbox/lib/tabs";
import { Row, Col } from "react-flexbox-grid";
import LogListItem from "./LogListItem";
import ArtifactListItem from "ui-mgr/artifacts/client/components/ListItem";
import SubJobListItem from "./SubJobListItem";
import api from "api.io/api.io-client";
import {
    Section as TASection,
    List as TAList,
    ControlButton as TAControlButton
} from "ui-components/type_admin";
import * as pathBuilder from "ui-lib/path_builder";
import * as queryBuilder from "ui-lib/query_builder";

class Item extends Component {
    constructor(props) {
        super(props);
        this.addStateVariable("runId", false);
        this.addStateVariable("runTabIndex", 0);
        this.addStateVariable("baselineCollectorIndex", 0);
        this.addStateVariable("statusMessage", { msg: "", type: "accept" });
    }

    _showMessage(msg, type = "accept") {
        this.state.statusMessage.set({ msg: msg, type: type });
    }

    _closeSnackbar() {
        this._showMessage("");
    }

    async _getLogRepoRestUrl() {
        const response = await api.type.get("logrepo.state");

        if (response.length !== 1) {
            console.error("_getLogRepoRestUrl: Couldn't get logrepo rest uri, response=", response);

            return false;
        }

        return response[0].provides.REST.uri;
    }

    async _downloadLog(item) {
        const logRepoUrl = await this._getLogRepoRestUrl();
        if (logRepoUrl) {
            const url = `${logRepoUrl}/log/${item._id}/download`;
            console.log(`Download from ${url}`);

            // Ugly way of downloading file from javascript...
            window.location = url;
        }
    }

    async onRerun() {
        const response = await api.type.action(
            "exec.job",
            this.props.item._id,
            "rerun"
        );
        if (response.result === "success") {
            this._showMessage("Job re-run requested");
        } else {
            console.error("onRerun: Couldn't rerun job, response=", response);
        }
    }

    render() {
        this.log("render", this.props, this.state);
        const item = this.props.item;

        const controls = this.props.controls.slice(0);

        if (item.finished) {
            controls.push((
                <TAControlButton
                    key="rerun"
                    label="Rerun"
                    onClick={() => this.onRerun()}
                />
            ));
        }

        const arrayGetIds = (arr) => arr.map((item) => item.id);

        let baselineContent;

        if (item.baseline.content) {
            baselineContent = (
                <div>
                    <h6 className={this.props.theme.title}>Baseline</h6>
                    <table className={this.props.theme.properties}>
                        <tbody>
                            <tr>
                                <td>Id</td>
                                <td>{item.baseline._id}</td>
                            </tr>
                            <tr>
                                <td>Name</td>
                                <td>{item.baseline.name}</td>
                            </tr>
                        </tbody>
                    </table>

                    <Tabs
                        index={this.state.baselineCollectorIndex.value}
                        onChange={this.state.baselineCollectorIndex.set}
                    >
                    {item.baseline.content.map((collector, index) => (
                        <Tab key={index} label={`${collector.name} (${collector.id.length})`}>
                            <TAList
                                type={collector.type}
                                query={queryBuilder.anyOf("_id", collector.id)}
                                onSelect={(item) => {
                                    this.context.router.push({
                                        pathname: pathBuilder.fromType(collector.type, item)
                                    });
                                }}
                            />
                        </Tab>
                    ))}
                    </Tabs>
                </div>
            );
        }

        const lastRunId = item.lastRunId === false ? 0 : item.lastRunId;
        const runContent = (
            <div>
                <h6 className={this.props.theme.title}>Runs</h6>
                <Tabs
                    index={this.state.runId.value === false ? lastRunId : this.state.runId.value}
                    onChange={this.state.runId.set}
                >
                    {item.runs.map((run, index) => (
                        <Tab key={index} label={`Run ${index}`}>
                            <div className={this.props.theme.panel}>
                                <h6 className={this.props.theme.title}>Properties</h6>
                                <Row>
                                    <Col xs={12} md={5} className={this.props.theme.panel}>
                                        <table className={this.props.theme.properties}>
                                            <tbody>
                                                <tr>
                                                    <td>Slave Id</td>
                                                    <td>
                                                        <Link
                                                            label={run.slaveId || "None"}
                                                            onClick={() => {
                                                                this.context.router.push({
                                                                    pathname: pathBuilder.fromType("exec.slave", { _id: run.slaveId })
                                                                });
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Finished</td>
                                                    <td>{run.finished ? `at ${run.finished}` : "No"}</td>
                                                </tr>
                                                <tr>
                                                    <td>Status</td>
                                                    <td>{run.status}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </Col>
                                </Row>
                            </div>
                            <Tabs index={this.state.runTabIndex.value} onChange={this.state.runTabIndex.set}>
                                <Tab key={0} label={`Logs (${run.logs.length})`}>
                                    <TAList
                                        type="logrepo.log"
                                        query={queryBuilder.anyOf("_id", run.logs.map((l) => l.id))}
                                        onSelect={this._downloadLog.bind(this)}
                                        ListItemComponent={LogListItem}
                                        listItemContext={run.logs}
                                    />
                                </Tab>
                                <Tab key={1} label={`Artifacts (${run.artifacts.length})`}>
                                    <TAList
                                        type="artifactrepo.artifact"
                                        query={queryBuilder.anyOf("_id", arrayGetIds(run.artifacts))}
                                        onSelect={(item) => {
                                            this.context.router.push({
                                                pathname: pathBuilder.fromType("artifactrepo.artifact", item)
                                            });
                                        }}
                                        ListItemComponent={ArtifactListItem}
                                    />
                                </Tab>
                                <Tab key={2} label={`Revisions (${run.revisions.length})`}>
                                    <TAList
                                        type="coderepo.revision"
                                        query={queryBuilder.anyOf("_id", arrayGetIds(run.revisions))}
                                        onSelect={(item) => {
                                            this.context.router.push({
                                                pathname: pathBuilder.fromType("coderepo.revision", item)
                                            });
                                        }}
                                    />
                                </Tab>
                                <Tab key={3} label={`Sub Jobs (${run.subJobs.length})`}>
                                    <TAList
                                        type="exec.subjob"
                                        query={queryBuilder.anyOf("_id", arrayGetIds(run.subJobs))}
                                        ListItemComponent={SubJobListItem}
                                        listItemContext={{ pathname: this.props.pathname }}
                                    />
                                </Tab>
                            </Tabs>
                        </Tab>
                    ))}
                </Tabs>
            </div>
        );

        return (
            <div>
                <TASection
                    controls={controls}
                    breadcrumbs={this.props.breadcrumbs}
                >
                    <div className={this.props.theme.container}>
                        <Row>
                            <Col className={this.props.theme.panel}>
                                <div className={this.props.theme.tags}>
                                    {item.tags.map((tag) => (
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
                                            <td>{item.name}</td>
                                        </tr>
                                        <tr>
                                            <td>Criteria</td>
                                            <td>{item.criteria}</td>
                                        </tr>
                                        <tr>
                                            <td>Slave Id</td>
                                            <td>
                                                <Link
                                                    label={ item.slaveId || "None" }
                                                    onClick={() => {
                                                        this.context.router.push({
                                                            pathname: pathBuilder.fromType("exec.slave", { _id: item.slaveId })
                                                        });
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Finished</td>
                                            <td>{item.finished ? `at ${item.finished}` : "No"}</td>
                                        </tr>
                                        <tr>
                                            <td>Status</td>
                                            <td>{item.status}</td>
                                        </tr>
                                        <tr>
                                            <td>Created</td>
                                            <td>{item.created}</td>
                                        </tr>
                                        <tr>
                                            <td>Saved</td>
                                            <td>{item.saved}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </Col>
                            <Col xs={12} md={7} className={this.props.theme.panel}>
                                {baselineContent}
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} className={this.props.theme.panel}>
                                {runContent}
                            </Col>
                        </Row>
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

Item.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default Item;
