
import React from "react";
import LightComponent from "ui-lib/light_component";
import { CardTitle } from "react-toolbox/lib/card";
import ExpandableCard from "ui-components/expandable_card";
import { StatusIcon } from "ui-components/status";
import stateVar from "ui-lib/state_var";
import statusText from "ui-lib/status_text";

class StepResultCard extends LightComponent {
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
                    title={`${this.props.item.name} step ${statusText[this.props.item.status]}`}
                />
            </ExpandableCard>
        );
    }
}

StepResultCard.defaultProps = {
    expanded: true,
    expandable: false
};

StepResultCard.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool
};

export default StepResultCard;
