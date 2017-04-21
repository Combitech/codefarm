
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import stateVar from "ui-lib/state_var";
import { Tab, Tabs } from "react-toolbox/lib/tabs";
import OutputTab from "./job/OutputTab";
import JobTab from "./job/JobTab";
import SubJobTab from "./job/SubJobTab";
import LogTab from "./job/LogTab";

class JobView extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            tabIndex: stateVar(this, "tabIndex", 0)
        };
    }

    render() {
        this.log("render", this.props, this.state);

        const job = this.props.item;
        const run = job.runs[this.props.item.lastRunId];

        return (
            <Tabs
                index={parseInt(this.state.tabIndex.value, 10)}
                onChange={(index) => this.state.tabIndex.set(`${index}`)}
            >
                <Tab
                    key="info"
                    label="Job"
                >
                    <JobTab
                        theme={this.props.theme}
                        job={job}
                    />
                </Tab>
                {(run && run.logs.length) && (
                    <Tab
                        key="logs"
                        label="Logs"
                    >
                        <LogTab
                            theme={this.props.theme}
                            logRefs={run.logs}
                        />
                    </Tab>
                )}
                {(run && run.subJobs.length) && (
                    <Tab
                        key="subjobs"
                        label="Sub-Jobs"
                    >
                        <SubJobTab
                            theme={this.props.theme}
                            subJobRefs={run.subJobs}
                        />
                    </Tab>
                )}
                {(run && (run.artifacts.length || run.revisions.length)) && (
                    <Tab
                        key="output"
                        label="Output"
                    >
                        <OutputTab
                            theme={this.props.theme}
                            artifactRefs={run.artifacts}
                            revisionRefs={run.revisions}
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

JobView.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object
};

export default JobView;
