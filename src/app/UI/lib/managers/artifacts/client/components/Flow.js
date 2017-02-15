
import React from "react";
import Component from "ui-lib/component";
import { JobFlow, StepStatus } from "ui-components/flow";
import { ensureArray } from "misc";

class FlowComponent extends Component {
    constructor(props) {
        super(props);

        this.addTypeListStateVariable("steps", "flowctrl.step", (props) => {
            return {
                flow: props.flow._id,
                visible: true
            };
        }, false);
    }

    render() {
        this.log("render", this.props, JSON.stringify(this.state, null, 2));

        const firstStep = {
            id: "First",
            name: "Overview",
            meta: {
                status: "neutral"
            },
            type: StepStatus,
            disabled: () => false,
            active: () => !this.props.step.value,
            parentIds: [],
            handlers: {
                onClick: () => this.props.step.set()
            }
        };

        const steps = this.state.steps.map((step) => {
            const parentIds = step.parentSteps.slice(0);

            if (parentIds.length === 0) {
                parentIds.push(firstStep.id);
            }

            return {
                id: step._id,
                type: StepStatus,
                name: step.name,
                meta: {
                    item: this.props.item,
                    flow: this.props.flow,
                    step: step
                },
                disabled: () => false,
                active: () => this.props.step.value === step.name,
                parentIds: parentIds,
                handlers: {
                    onClick: () => this.props.step.set(step.name)
                }
            };
        });

        steps.push(firstStep);

        const jobRefs = [];
        for (const data of ensureArray(this.props.itemExt.data)) {
            jobRefs.push(...data.refs);
        }

        return (
            <JobFlow
                theme={this.props.theme}
                jobRefs={jobRefs}
                firstStep={firstStep}
                steps={steps}
                columnSpan={8}
            />
        );
    }
}

FlowComponent.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    itemExt: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    flow: React.PropTypes.object.isRequired,
    step: React.PropTypes.object.isRequired
};

FlowComponent.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default FlowComponent;
