
import React from "react";
import LightComponent from "ui-lib/light_component";
// import { StatusIcon } from "ui-components/status";
import LogViewer from "ui-components/log_viewer";
import { Tab, Tabs } from "react-toolbox/lib/tabs";
import api from "api.io/api.io-client";
import stateVar from "ui-lib/state_var";

class Job extends LightComponent {
    constructor(props) {
        super(props, true);

        this.state = {
            tabIndex: stateVar(this, "tabIndex", 0)
        };
    }

    render() {
        this.log("render", this.props, this.state);

        const logRefs = this.props.jobItem.runs[this.props.jobItem.runs.length - 1].logs;

        return (
            <Tabs
                index={parseInt(this.state.tabIndex.value, 10)}
                onChange={(index) => this.state.tabIndex.set(`${index}`)}
            >
                {logRefs.map((ref) => (
                    <Tab
                        key={ref.id}
                        label={ref.name}
                    >
                        <LogViewer log={ref} />
                    </Tab>
                ))}
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
