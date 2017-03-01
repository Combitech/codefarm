
import React from "react";
import HiddenText from "ui-components/hidden_text";
import Chip from "react-toolbox/lib/chip";
import DateTime from "ui-components/datetime";

class JobOverview extends React.PureComponent {
    render() {
        return (
            <table className={this.props.theme.information}>
                <tbody>
                    <tr>
                        <td>Job name</td>
                        <td>
                            <span className={this.props.theme.monospace}>
                                {this.props.job.name}
                            </span>
                            <HiddenText
                                className={this.props.theme.id}
                                label="SHOW ID"
                                text={this.props.job._id}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Baseline name</td>
                        <td>
                            <span className={this.props.theme.monospace}>
                                {this.props.job.baseline.name}
                            </span>
                            <HiddenText
                                className={this.props.theme.id}
                                label="SHOW ID"
                                text={this.props.job.baseline._id}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Created</td>
                        <td>
                            <DateTime value={this.props.job.created} />
                        </td>
                    </tr>
                    <tr>
                        <td>Finished at</td>
                        <td>
                            <DateTime
                                value={this.props.job.finished}
                                defaultText="No finished yet"
                            />
                        </td>
                    </tr>
                    {this.props.job.slaveId && (
                        <tr>
                            <td>Executed on slave</td>
                            <td className={this.props.theme.monospace}>
                                {this.props.job.slaveId}
                            </td>
                        </tr>
                    )}
                    <tr>
                        <td>Tags</td>
                        <td>
                            {this.props.job.tags.map((tag) => (
                                <Chip key={tag}>{tag}</Chip>
                            ))}
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

JobOverview.propTypes = {
    theme: React.PropTypes.object,
    job: React.PropTypes.object.isRequired
};

export default JobOverview;
