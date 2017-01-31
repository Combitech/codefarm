
import React from "react";
import Component from "ui-lib/component";
import { StepStatus } from "ui-components/flow";

class Step extends Component {
    constructor(props) {
        super(props);

        this.addTypeListStateVariable("baselines", "baselinegen.baseline", (props) => {
            if (!props.item.meta.step) {
                return false;
            }

            return {
                name: props.item.meta.step.baseline,
                "content.id": props.item.meta.revision._id
            };
        }, true);
    }

    render() {
        this.log("render", this.props, this.state);

        return (
            <StepStatus
                {...this.props}
                baselines={this.state.baselines}
            />
        );
    }
}

Step.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired
};

export default Step;
