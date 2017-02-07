
import React from "react";
import Component from "ui-lib/component";
import { StatusIcon } from "ui-components/status";

class Job extends Component {
    constructor(props) {
        super(props);

        this.addStateVariable("run", false);
    }

    render() {
        this.log("render", this.props, this.state);

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
        );
    }
}

Job.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    itemExt: React.PropTypes.object.isRequired,
    job: React.PropTypes.object
};

export default Job;
