
import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import LightComponent from "ui-lib/light_component";
import { HiddenText } from "ui-components/hidden_text";
import { DateTime } from "ui-components/datetime";
import { Tags } from "ui-components/tags";
import DataCard from "./DataCard";
import { StatusIcon } from "ui-components/status";
import { Claim } from "ui-components/claim";
import { CardTitle } from "react-toolbox/lib/card";
import stateVar from "ui-lib/state_var";
import statusText from "ui-lib/status_text";

class SubJobCard extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded)
        };
    }

    render() {
        return (
            <DataCard
                theme={this.props.theme}
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
                    title={`${this.props.item.name} ${statusText[this.props.item.status]}`}
                    subtitle={(
                        <DateTime
                            value={this.props.item.finished ? this.props.item.finished : this.props.item.created}
                            niceDate={true}
                        />
                    )}
                />
                <If condition={this.state.expanded.value}>
                    <table className={this.props.theme.table}>
                        <tbody>
                            <tr>
                                <td>Name</td>
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
                                <td>Started&nbsp;at</td>
                                <td>
                                    <DateTime
                                        value={this.props.item.created}
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
                            <If condition={this.props.item.result}>
                                <For each="key" of={Object.keys(this.props.item.result)}>
                                    <tr key={key}>
                                        <td>{key}</td>
                                        <td>
                                            {this.props.item.result[key]}
                                        </td>
                                    </tr>
                                </For>
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
                        </tbody>
                    </table>
                </If>
            </DataCard>
        );
    }
}

SubJobCard.defaultProps = {
    expanded: false,
    expandable: true
};

SubJobCard.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    expanded: PropTypes.bool,
    expandable: PropTypes.bool
};

export default SubJobCard;
