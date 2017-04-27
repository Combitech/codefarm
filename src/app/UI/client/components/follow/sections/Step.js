
import React from "react";
import PropTypes from "prop-types";
import statuslib from "ui-lib/statuslib";
import { Header } from "ui-components/layout";
import { StepResultCard } from "ui-components/data_card";

class Step extends React.PureComponent {
    render() {
        const item = {
            name: this.props.step,
            status: statuslib.fromTags(this.props.item.tags, this.props.step)
        };

        return (
            <div>
                <Header label="Step" />
                <StepResultCard
                    item={item}
                    expanded={true}
                    expandable={false}
                />
            </div>
        );
    }
}

Step.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    step: PropTypes.string.isRequired
};

export default Step;
