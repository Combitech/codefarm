
import React from "react";
import Component from "ui-lib/component";
import { Flow, StepStatus } from "ui-components/flow";
import moment from "moment";
import { ensureArray } from "misc";

class FlowComponent extends Component {
    constructor(props) {
        super(props, false);

        this.addTypeListStateVariable("steps", "flowctrl.step", (props) => {
            return {
                flow: props.flow._id,
                visible: true
            };
        }, true);
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

        const statuses = new Set();

        const myBl = this.props.item.name;
        const myBlSteps = this.state.steps.filter((item) => item.baseline === myBl);
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

        const stepData = myBlSteps.concat(myBlChildSteps);
        const steps = stepData.map((step) => {
            const parentIds = step.parentSteps.slice(0)
                // Remove references to parents not included in flow
                .filter((stepId) => stepData.some((item) => item._id === stepId));

            // Insert entry steps as parents to step with myBl as baseline
            if (step.baseline === myBl) {
                parentIds.push(firstStep.id);
            }

            let status = false;
            const jobRefs = [];
            for (const data of ensureArray(this.props.itemExt.data)) {
                for (const ref of data.refs.filter((ref) => ref.name === step.name)) {
                    jobRefs.push(ref);
                }
            }

            jobRefs.sort((a, b) => moment(a.data.created).isBefore(b.data.created) ? 1 : -1);
            const job = jobRefs[0] ? jobRefs[0].data : false;

            if (job) {
                status = job.status;
            }

            statuses.add(status || "unknown");

            return {
                id: step._id,
                type: StepStatus,
                name: step.name,
                meta: {
                    status: status,
                    revision: this.props.item,
                    flow: this.props.flow,
                    step: step,
                    job: job
                },
                disabled: () => false,
                active: () => this.props.step.value === step.name,
                parentIds: parentIds,
                handlers: {
                    onClick: () => this.props.step.set(step.name)
                }
            };
        });

        console.log("STATUSES", statuses);

        if (statuses.has("fail") || statuses.has("aborted")) {
            firstStep.meta.status = "unhappy";
        } else if (statuses.has("unknown") || statuses.has("allocated") || statuses.has("queued") || statuses.has("ongoing")) {
            firstStep.meta.status = "neutral";
        } else if (statuses.has("success") || statuses.has("skip")) {
            firstStep.meta.status = "happy";
        }

        steps.push(firstStep);

        return (
            <Flow
                theme={this.props.theme}
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
