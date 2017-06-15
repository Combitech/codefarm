
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { DateTime } from "ui-components/datetime";
import DataCard from "./DataCard";
import { CardTitle } from "react-toolbox/lib/card";
import stateVar from "ui-lib/state_var";
import * as pathBuilder from "ui-lib/path_builder";

class BaselineRepositoryBaselineCard extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded)
        };
    }

    render() {
        const myItemPath = pathBuilder.fromType("baselinerepo.baseline", this.props.item);

        return (
            <DataCard
                theme={this.props.theme}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
                path={myItemPath}
            >
                <CardTitle
                    title={(
                        <span>
                            {`${this.props.item.name}`}
                        </span>
                    )}
                    subtitle={(
                        <DateTime
                            value={this.props.item.created}
                            niceDate={true}
                        />
                    )}
                />
            </DataCard>
        );
    }
}

BaselineRepositoryBaselineCard.defaultProps = {
    expanded: false,
    expandable: true,
    clickable: false
};

BaselineRepositoryBaselineCard.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    expanded: PropTypes.bool,
    expandable: PropTypes.bool,
    clickable: PropTypes.bool
};

BaselineRepositoryBaselineCard.contextTypes = {
    router: PropTypes.object.isRequired
};

export default BaselineRepositoryBaselineCard;
