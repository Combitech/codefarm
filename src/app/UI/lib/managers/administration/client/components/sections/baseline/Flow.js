
import React from "react";
import LightComponent from "ui-lib/light_component";
import { JobFlow, StepStatus } from "ui-components/flow";
import { ensureArray } from "misc";
import {
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";
import StepListObservable from "ui-observables/step_list";
import { States as ObservableDataStates } from "ui-lib/observable_data";

class FlowComponent extends LightComponent {
    constructor(props) {
        super(props);

        this.stepList = new StepListObservable({
            flowId: props.flow._id,
            subscribe: false
        });

        this.state = {
            stepList: this.stepList.value.getValue(),
            stepListState: this.stepList.state.getValue()
        };
    }

    componentDidMount() {
        this.log("componentDidMount");
        this.addDisposable(this.stepList.start());
        this.addDisposable(this.stepList.value.subscribe((stepList) => this.setState({ stepList })));
        this.addDisposable(this.stepList.state.subscribe((stepListState) => this.setState({ stepListState })));
    }

    componentWillReceiveProps(nextProps) {
        this.log("componentWillReceiveProps");
        if (nextProps.flow) {
            this.stepList.setOpts({ flowId: nextProps.flow._id });
        }
    }

    render() {
        this.log("render", this.props, JSON.stringify(this.state, null, 2));

        let loadIndicator;
        if (this.state.state === ObservableDataStates.LOADING) {
            loadIndicator = (
                <TALoadIndicator />
            );
        }

        const firstStep = {
            id: `FirstStep_${this.props.item._id}`,
            name: this.props.firstStepName,
            meta: {
                status: "neutral"
            },
            type: StepStatus,
            disabled: () => false,
            active: () => this.props.step === "",
            parentIds: [],
            handlers: {
                onClick: () => this.props.onStepSelect && this.props.onStepSelect(null)
            }
        };

        const myBl = this.props.item.name;
        let mySteps = this.state.stepList.toJS().filter((item) => item.baseline.id === myBl);
        // Get all steps that are descendants to a step with baseline equal to myBl
        const getAllParents = (items, item) => {
            let parents = items.filter((i) => item.parentSteps.includes(i._id));

            for (const parent of parents) {
                parents = parents.concat(getAllParents(items, parent));
            }

            return parents;
        };
        const myBlChildSteps = this.state.stepList.toJS().filter((step, index, self) =>
            getAllParents(self, step).some((item) => item.baseline.id === myBl)
        );
        mySteps = mySteps.concat(myBlChildSteps);

        const steps = mySteps.map((step) => {
            const parentIds = step.parentSteps.slice(0)
                // Remove references to parents not included in flow
                .filter((stepId) => mySteps.some((item) => item._id === stepId));

            // Insert first step as parent
            if (step.baseline.id === myBl) {
                parentIds.push(firstStep.id);
            }

            const item = {
                id: step._id,
                type: StepStatus,
                name: step.name,
                meta: {
                    item: this.props.item,
                    flow: this.props.flow,
                    step: step
                },
                disabled: () => false,
                active: () => this.props.step === step.name,
                parentIds: parentIds,
                handlers: {
                    onClick: () => this.props.onStepSelect && this.props.onStepSelect(step.name)
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
            <div>
                {loadIndicator}
                <JobFlow
                    theme={this.props.theme}
                    jobRefs={jobRefs}
                    firstStep={firstStep}
                    steps={steps}
                    columnSpan={8}
                />
            </div>
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
    step: React.PropTypes.string,
    firstStepName: React.PropTypes.string,
    onStepSelect: React.PropTypes.func
};

FlowComponent.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default FlowComponent;
