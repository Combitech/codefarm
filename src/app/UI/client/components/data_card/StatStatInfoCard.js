
import React from "react";
import LightComponent from "ui-lib/light_component";
import { CardTitle } from "react-toolbox/lib/card";
import ExpandableCard from "ui-components/expandable_card";
import stateVar from "ui-lib/state_var";

class StatStatInfoCard extends LightComponent {
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
                    title={(
                        <div>
                            {this.props.item.id}
                        </div>
                    )}
                />
                <If condition={this.state.expanded.value}>
                    <table className={this.props.theme.table}>
                        <tbody>
                            <tr>
                                <td>Num&nbsp;Samples</td>
                                <td>{this.props.item.cnt}</td>
                            </tr>
                            <tr>
                                <td>Min</td>
                                <td>{this.props.item.min}</td>
                            </tr>
                            <tr>
                                <td>Max</td>
                                <td>{this.props.item.max}</td>
                            </tr>
                            <tr>
                                <td>Average</td>
                                <td>{this.props.item.avg}</td>
                            </tr>
                            <tr>
                                <td>Sum</td>
                                <td>{this.props.item.sum}</td>
                            </tr>
                            <tr>
                                <td>Std.Dev. population</td>
                                <td>{this.props.item.stdDevPop}</td>
                            </tr>
                            <tr>
                                <td>Std.Dev. Sample</td>
                                <td>{this.props.item.stdDevSamp}</td>
                            </tr>
                        </tbody>
                    </table>
                </If>
            </ExpandableCard>
        );
    }
}

StatStatInfoCard.defaultProps = {
    expanded: false,
    expandable: true
};

StatStatInfoCard.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool
};

StatStatInfoCard.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default StatStatInfoCard;
