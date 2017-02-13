
import React from "react";
import Component from "ui-lib/component";
import { JobFlow, StepStatus } from "ui-components/flow";
import { ensureArray } from "misc";

class FlowComponent extends Component {
    constructor(props) {
        super(props, false);

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
            id: `FirstStep_${this.props.item._id}`,
            name: this.props.firstStepName,
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

        const myBl = this.props.item.name;
        let mySteps = this.state.steps.filter((item) => item.baseline === myBl);
        // Get all steps that are descendants to a step with baseline equal to myBl
        const getAllParents = (items, item) => {
            let parents = items.filter((i) => item.parentSteps.includes(i._id));

            for (const parent of parents) {
                parents = parents.concat(getAllParents(items, parent));
            }

            return parents;
        };
        const myBlChildSteps = this.state.steps.filter((step, index, self) =>
            getAllParents(self, step).some((item) => item.baseline === myBl)
        );
        mySteps = mySteps.concat(myBlChildSteps);

        const steps = mySteps.map((step) => {
            const parentIds = step.parentSteps.slice(0)
                // Remove references to parents not included in flow
                .filter((stepId) => mySteps.some((item) => item._id === stepId));

            // Insert first step as parent
            if (step.baseline === this.props.item.name) {
                parentIds.push(firstStep.id);
            }

            const item = {
                id: step._id,
                type: StepStatus,
                name: step.name,
                meta: {
                    baseline: this.props.item,
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

            return item;
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

FlowComponent.defaultProps = {
    firstStepName: "Baseline"
};

FlowComponent.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    itemExt: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    flow: React.PropTypes.object.isRequired,
    step: React.PropTypes.object.isRequired,
    firstStepName: React.PropTypes.string
};

FlowComponent.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default FlowComponent;
