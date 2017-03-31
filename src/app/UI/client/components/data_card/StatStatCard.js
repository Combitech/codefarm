
import React from "react";
import LightComponent from "ui-lib/light_component";
import { CardTitle } from "react-toolbox/lib/card";
import DateTime from "ui-components/datetime";
import Tags from "ui-components/tags";
import ExpandableCard from "ui-components/expandable_card";
import stateVar from "ui-lib/state_var";
import * as pathBuilder from "ui-lib/path_builder";
import CardLinkIcon from "./CardLinkIcon";

class StatStatCard extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded)
        };
    }

    render() {
        const myItemPath = pathBuilder.fromType("stat.stat", this.props.item);

        return (
            <ExpandableCard
                className={this.props.theme.card}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
            >
                <CardTitle
                    title={(
                        <div>
                            {this.props.item._id}
                            <CardLinkIcon
                                theme={this.props.theme}
                                path={myItemPath}
                                name="statistics"
                            />
                        </div>
                    )}
                />
                <If condition={this.state.expanded.value}>
                    <table className={this.props.theme.table}>
                        <tbody>
                            <tr>
                                <td>Specification</td>
                                <td>{this.props.item.specRef.id}</td>
                            </tr>
                            <If condition={this.props.item.fieldNames}>
                                <tr>
                                    <td>Reported&nbsp;fields</td>
                                    <td>
                                        {this.props.item.fieldNames.join(", ")}
                                    </td>
                                </tr>
                            </If>
                            <tr>
                                <td>Last&nbsp;data</td>
                                <td>
                                    <span className={this.props.theme.codeLineWrap}>
                                        {JSON.stringify(this.props.item.lastData, null, 2)}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>State</td>
                                <td>
                                    <span className={this.props.theme.codeLineWrap}>
                                        {JSON.stringify(this.props.item.state, null, 2)}
                                    </span>
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
                                <td>Updated&nbsp;at</td>
                                <td>
                                    <DateTime
                                        value={this.props.item.saved}
                                        niceDate={true}
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
            </ExpandableCard>
        );
    }
}

StatStatCard.defaultProps = {
    expanded: false,
    expandable: true
};

StatStatCard.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool
};

StatStatCard.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default StatStatCard;
