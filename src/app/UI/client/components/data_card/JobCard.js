
import React from "react";
import LightComponent from "ui-lib/light_component";
import { CardTitle } from "react-toolbox/lib/card";
import HiddenText from "ui-components/hidden_text";
import DateTime from "ui-components/datetime";
import Chip from "react-toolbox/lib/chip";
import ExpandableCard from "ui-components/expandable_card";
import { StatusIcon } from "ui-components/status";
import stateVar from "ui-lib/state_var";
import statusText from "ui-lib/status_text";

class JobCard extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded)
        };
    }

    render() {
        return (
            <ExpandableCard
                className={this.props.theme.card}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
            >
                <CardTitle
                    avatar={(
                        <StatusIcon
                            className={this.props.theme.avatar}
                            size={40}
                            status={this.props.item.status}
                        />
                    )}
                    title={`${this.props.item.name} job ${statusText[this.props.item.status]}`}
                    subtitle={(
                        <DateTime
                            value={this.props.item.finished ? this.props.item.finished : this.props.item.saved}
                            niceDate={true}
                        />
                    )}
                />
                {this.state.expanded.value && (
                    <table className={this.props.theme.table}>
                        <tbody>
                            <tr>
                                <td>Job name</td>
                                <td>
                                    <span className={this.props.theme.monospace}>
                                        {this.props.item.name}
                                    </span>
                                    <HiddenText
                                        className={this.props.theme.hiddenText}
                                        label="SHOW ID"
                                        text={this.props.item._id}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Baseline name</td>
                                <td>
                                    <span className={this.props.theme.monospace}>
                                        {this.props.item.baseline.name}
                                    </span>
                                    <HiddenText
                                        className={this.props.theme.hiddenText}
                                        label="SHOW ID"
                                        text={this.props.item.baseline._id}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Created</td>
                                <td>
                                    <DateTime
                                        value={this.props.item.created}
                                        niceDate={true}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Finished at</td>
                                <td>
                                    <DateTime
                                        value={this.props.item.finished}
                                        niceDate={true}
                                        defaultText="No finished yet"
                                    />
                                </td>
                            </tr>
                            {this.props.item.slaveId && (
                                <tr>
                                    <td>Executed on slave</td>
                                    <td className={this.props.theme.monospace}>
                                        {this.props.item.slaveId}
                                    </td>
                                </tr>
                            )}
                            <tr>
                                <td>Tags</td>
                                <td>
                                    {this.props.item.tags.map((tag) => (
                                        <Chip key={tag}>{tag}</Chip>
                                    ))}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}
            </ExpandableCard>
        );
    }
}

JobCard.defaultProps = {
    expanded: false,
    expandable: true
};

JobCard.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool
};

export default JobCard;
