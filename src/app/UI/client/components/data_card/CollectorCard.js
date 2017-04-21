
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { HiddenText } from "ui-components/hidden_text";
import { UserAvatar } from "ui-components/user_avatar";
import { DateTime } from "ui-components/datetime";
import { Tags } from "ui-components/tags";
import DataCard from "./DataCard";
import { CardTitle } from "react-toolbox/lib/card";
import { TypeChip } from "ui-components/data_chip";
import stateVar from "ui-lib/state_var";

class CollectorCard extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded)
        };
    }

    render() {
        const emblem = () => {
            if (this.props.item.state === "not_ready") {
                return;
            } else if (this.props.item.state === "ready") {
                return "/Cheser/16x16/emblems/emblem-generic.png";
            } else if (this.props.item.state === "completed") {
                return "/Cheser/16x16/emblems/emblem-default.png";
            } else if (this.props.item.state === "used") {
                return "/Cheser/16x16/emblems/emblem-documents.png";
            } else if (this.props.item.state === "stopped") {
                return "/Cheser/16x16/emblems/emblem-dropbox-unsyncable.png";
            }
        };

        return (
            <DataCard
                theme={this.props.theme}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
            >
                <CardTitle
                    avatar={(
                        <UserAvatar
                            className={this.props.theme.avatar}
                            defaultUrl="/Cheser/48x48/apps/alacarte.png"
                            emblem={emblem()}
                        />
                    )}
                    title={this.props.item.name}
                    subtitle={(
                        <DateTime
                            value={this.props.item.created}
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
                                    <span>{this.props.item.name}</span>
                                    <HiddenText
                                        className={this.props.theme.hiddenText}
                                        label="SHOW ID"
                                        text={this.props.item._id}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>State</td>
                                <td>{this.props.item.state}</td>
                            </tr>
                            <tr>
                                <td>Specification</td>
                                <td>
                                    <TypeChip
                                        itemRef={{
                                            _ref: true,
                                            type: "baselinegen.specification",
                                            id: this.props.item.baseline
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Collect&nbsp;type</td>
                                <td>{this.props.item.collectType}</td>
                            </tr>
                            <tr>
                                <td>Criteria</td>
                                <td>{this.props.item.criteria}</td>
                            </tr>
                            <tr>
                                <td>Limit</td>
                                <td>{this.props.item.limit}</td>
                            </tr>
                            <tr>
                                <td>Collect&nbsp;latest</td>
                                <td>{this.props.item.latest ? "Yes" : "No"}</td>
                            </tr>
                            <tr>
                                <td>Requested&nbsp;at</td>
                                <td>
                                    <DateTime
                                        value={this.props.item.requested}
                                        niceDate={true}
                                        defaultText="Not requested yet"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Content</td>
                                <td>
                                    <For each="id" of={this.props.item.ids}>
                                        <TypeChip
                                            key={id}
                                            itemRef={{
                                                _ref: true,
                                                type: this.props.item.collectType,
                                                id: id
                                            }}
                                        />
                                    </For>
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

CollectorCard.defaultProps = {
    expanded: false,
    expandable: true,
    clickable: false
};

CollectorCard.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    expanded: PropTypes.bool,
    expandable: PropTypes.bool,
    clickable: PropTypes.bool
};

export default CollectorCard;
