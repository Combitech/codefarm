
import React from "react";
import LightComponent from "ui-lib/light_component";
import { UserAvatar } from "ui-components/user_avatar";
import { DateTime } from "ui-components/datetime";
import { Tags } from "ui-components/tags";
import DataCard from "./DataCard";
import { CardTitle } from "react-toolbox/lib/card";
import { TypeChip } from "ui-components/data_chip";
import stateVar from "ui-lib/state_var";
import * as pathBuilder from "ui-lib/path_builder";

class BaselineCard extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded)
        };
    }

    render() {
        const myItemPath = pathBuilder.fromType(this.props.item.type, this.props.item, {
            prefix: this.props.linkToAdmin ? "admin" : false,
            idMap: {
                "_id": "name",
                "_id_baseline": "_id"
            }
        });

        return (
            <DataCard
                theme={this.props.theme}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
                path={myItemPath}
            >
                <CardTitle
                    avatar={(
                        <UserAvatar
                            className={this.props.theme.avatar}
                            defaultUrl="/Cheser/48x48/emblems/emblem-documents.png"
                        />
                    )}
                    title={this.props.item._id}
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
                                <td>{this.props.item.name}</td>
                            </tr>
                            <tr>
                                <td>Specification</td>
                                <td>
                                    <TypeChip
                                        itemRef={{
                                            _ref: true,
                                            type: "baselinegen.specification",
                                            id: this.props.item.name
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Content</td>
                                <td>
                                    <For each="ref" of={this.props.item.content}>
                                        <For each="id" of={ref.id}>
                                            <TypeChip
                                                key={id}
                                                itemRef={{
                                                    _ref: true,
                                                    name: ref.name,
                                                    type: ref.type,
                                                    id: id
                                                }}
                                            />
                                        </For>
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

BaselineCard.defaultProps = {
    expanded: false,
    expandable: true,
    clickable: false
};

BaselineCard.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool,
    clickable: React.PropTypes.bool
};

export default BaselineCard;
