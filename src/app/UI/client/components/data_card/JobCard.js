
import React from "react";
import moment from "moment";
import LightComponent from "ui-lib/light_component";
import HiddenText from "ui-components/hidden_text";
import DateTime from "ui-components/datetime";
import Tags from "ui-components/tags";
import DataCard from "./DataCard";
import { StatusIcon } from "ui-components/status";
import { Claim } from "ui-components/claim";
import { CardTitle } from "react-toolbox/lib/card";
import { TypeChip } from "ui-components/data_chip";
import stateVar from "ui-lib/state_var";
import statusText from "ui-lib/status_text";
import * as pathBuilder from "ui-lib/path_builder";

class JobCard extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded)
        };
    }

    render() {
        const myItemPath = pathBuilder.fromType(this.props.item.type, this.props.item);

        return (
            <DataCard
                theme={this.props.theme}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
                path={this.props.clickable ? myItemPath : ""}
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
                <If condition={this.state.expanded.value}>
                    <table className={this.props.theme.table}>
                        <tbody>
                            <tr>
                                <td>Job&nbsp;name</td>
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
                                <td>Baseline</td>
                                <td>
                                    <TypeChip
                                        itemRef={{
                                            _ref: true,
                                            type: "baselinegen.baseline",
                                            id: this.props.item.baseline._id
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Created&nbsp;at</td>
                                <td>
                                    <DateTime
                                        value={this.props.item.created}
                                        niceDate={true}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Started&nbsp;at</td>
                                <td>
                                    <DateTime
                                        value={this.props.item.started}
                                        niceDate={true}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Finished&nbsp;at</td>
                                <td>
                                    <DateTime
                                        value={this.props.item.finished}
                                        niceDate={true}
                                        defaultText="No finished yet"
                                    />
                                </td>
                            </tr>
                            <If condition={this.props.item.finished}>
                                <tr>
                                    <td>Duration</td>
                                    <td>
                                        {moment.duration(moment(this.props.item.finished).diff(this.props.item.started)).humanize()}
                                    </td>
                                </tr>
                            </If>
                            <If condition={this.props.item.slaveId}>
                                <tr>
                                    <td>Slave</td>
                                    <td>
                                        <TypeChip
                                            itemRef={{
                                                _ref: true,
                                                type: "exec.slave",
                                                id: this.props.item.slaveId
                                            }}
                                        />
                                    </td>
                                </tr>
                            </If>
                            <tr>
                                <td>Claimed&nbsp;by</td>
                                <td>
                                    <Claim
                                        targetRef={{
                                            _ref: true,
                                            type: this.props.item.type,
                                            id: this.props.item._id
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Tags</td>
                                <td>
                                    <Tags list={this.props.item.tags} />
                                </td>
                            </tr>
                            <If condition={this.props.showAdvanced}>
                                <tr>
                                    <td>Workspace Name</td>
                                    <td>
                                        <Choose>
                                            <When condition={this.props.item.workspaceName}>
                                                {this.props.item.workspaceName}
                                            </When>
                                            <Otherwise>
                                                No name specified
                                            </Otherwise>
                                        </Choose>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Workspace Cleanup Policy</td>
                                    <td>{this.props.item.workspaceCleanup}</td>
                                </tr>
                            </If>
                        </tbody>
                    </table>
                </If>
            </DataCard>
        );
    }
}

JobCard.defaultProps = {
    expanded: false,
    expandable: true,
    clickable: false,
    showAdvanced: false
};

JobCard.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool,
    clickable: React.PropTypes.bool,
    showAdvanced: React.PropTypes.bool
};

JobCard.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default JobCard;
