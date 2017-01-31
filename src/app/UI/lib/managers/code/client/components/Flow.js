
import React from "react";
import Component from "ui-lib/component";
import { Flow } from "ui-components/flow";
import Step from "./Step";
import moment from "moment";

class FlowComponent extends Component {
    constructor(props) {
        super(props);

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
            id: "First",
            name: "Overview",
            meta: {
                status: "neutral"
            },
            type: Step,
            disabled: () => false,
            active: () => !this.props.step.value,
            parentIds: [],
            handlers: {
                onClick: () => this.props.step.set()
            }
        };

        const statuses = new Set();
        const steps = this.state.steps.map((step) => {
            const parentIds = step.parentSteps.slice(0);

            if (parentIds.length === 0) {
                parentIds.push(firstStep.id);
            }

            let status = false;
            const jobRefs = this.props.itemExt.data.refs.filter((ref) => ref.name === step.name);

            jobRefs.sort((a, b) => moment(a.data.created).isBefore(b.data.created) ? 1 : -1);

            if (jobRefs[0]) {
                status = jobRefs[0].data.status;
            }

            statuses.add(status || "unknown");

            return {
                id: step._id,
                type: Step,
                name: step.name,
                meta: {
                    status: status,
                    revision: this.props.item,
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

        console.log("STATUSES", statuses);

        if (statuses.has("fail") || statuses.has("aborted")) {
            firstStep.meta.status = "unhappy";
        } else if (statuses.has("unknown") || statuses.has("queued") || statuses.has("ongoing")) {
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
