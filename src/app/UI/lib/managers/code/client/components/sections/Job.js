
import React from "react";
import LightComponent from "ui-lib/light_component";
// import { StatusIcon } from "ui-components/status";
import LogViewer from "ui-components/log_viewer";
import { Tab, Tabs } from "react-toolbox/lib/tabs";
import { Row, Col } from "react-flexbox-grid";
import stateVar from "ui-lib/state_var";
import BaselineContentList from "./job/BaselineContentList";
import ArtifactList from "./job/ArtifactList";
import ItemComments from "./job/ItemComments";
import { JobCard } from "ui-components/data_card";

class Job extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            tabIndex: stateVar(this, "tabIndex", 0),
            showJobId: stateVar(this, "showJobId", false)
        };
    }

    render() {
        this.log("render", this.props, this.state);

        const job = this.props.jobItem;
        const run = job.runs[this.props.jobItem.lastRunId];

        return (
            <Tabs
                index={parseInt(this.state.tabIndex.value, 10)}
                onChange={(index) => this.state.tabIndex.set(`${index}`)}
            >
                <Tab
                    key="info"
                    label="Overview"
                >
                    <Row>
                        <Col xs={12} md={6}>
                            <h5 className={this.props.theme.sectionHeader}>Properties</h5>
                            <div className={this.props.theme.section}>
                                <JobCard
                                    job={job}
                                    expanded={true}
                                    expandable={false}
                                />
                            </div>

                            <h5 className={this.props.theme.sectionHeader}>Comments</h5>
                            <div className={this.props.theme.section}>
                                <ItemComments
                                    theme={this.props.theme}
                                    item={job}
                                />
                            </div>
                        </Col>
                        <Col xs={12} md={6}>
                            <h5 className={this.props.theme.sectionHeader}>In this run</h5>
                            <div className={this.props.theme.section}>
                                <BaselineContentList
                                    theme={this.props.theme}
                                    baselineRef={{
                                        _ref: true,
                                        id: job.baseline._id,
                                        type: job.baseline.type
                                    }}
                                />
                            </div>
                        </Col>
                    </Row>
                </Tab>
                {run.logs.map((ref) => (
                    <Tab
                        key={ref.id}
                        label={ref.name}
                    >
                        <LogViewer log={ref} />
                    </Tab>
                ))}
                {run.artifacts.length && (
                    <Tab
                        key="artifacts"
                        label="Artifacts"
                    >
                        <ArtifactList
                            theme={this.props.theme}
                            artifactRefs={run.artifacts}
                        />
                    </Tab>
                )}
            </Tabs>
        );
/*

        const rows = [];

        rows.push({
            name: "TC1",
            status: "fail",
            runs: [
                {
                    name: "#1",
                    status: "success"
                },
                {
                    name: "#2",
                    status: "fail"
                },
                {
                    name: "#3",
                    status: "success"
                },
                {
                    name: "#4",
                    status: "success"
                },
                {
                    name: "#5",
                    status: "success"
                }
            ]
        });

        return (
            <div>
                <table className={this.props.theme.jobTable}>
                    <thead>
                        <tr>
                            <th className={this.props.theme.subjobColumn}></th>
                            {rows[0].runs.map((run) => (
                                <th
                                    key={run.name}
                                    className={this.props.theme.runColumn}
                                >
                                    {run.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr
                                key={row.name}
                            >
                                <td
                                     className={this.props.theme.subjobColumn}
                                 >
                                    <span>{row.name}</span>
                                </td>
                                {row.runs.map((run) => (
                                    <td
                                        key={run.name}
                                        className={this.props.theme.runColumn}
                                    >
                                        {run.status && (
                                            <StatusIcon
                                                className={this.props.theme.statusIcon}
                                                status={run.status}
                                                size={24}
                                            />
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );*/
    }
}

Job.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    itemExt: React.PropTypes.object.isRequired,
    job: React.PropTypes.object
};

export default Job;
