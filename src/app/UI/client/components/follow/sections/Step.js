
import React from "react";
import statuslib from "ui-lib/statuslib";
import { Header } from "ui-components/layout";
import { StepResultCard } from "ui-components/data_card";

class Step extends React.PureComponent {
    render() {
        const item = {
            name: this.props.step,
            status: statuslib.guess(this.props.item, this.props.step)
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
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    step: React.PropTypes.string.isRequired
};

export default Step;
