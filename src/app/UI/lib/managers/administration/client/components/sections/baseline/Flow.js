
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { Flow as JobFlow, StepStatus } from "ui-components/flow";
import {
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";
import statuslib from "ui-lib/statuslib";
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
                onClick: () => this.props.onSelect && this.props.onSelect(null)
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

        const statuses = [];
        const steps = mySteps.map((step) => {
            const parentIds = step.parentSteps.slice(0)
                // Remove references to parents not included in flow
                .filter((stepId) => mySteps.some((item) => item._id === stepId));

            // Insert first step as parent
            if (step.baseline.id === myBl) {
                parentIds.push(firstStep.id);
            }

            const status = statuslib.fromTags(this.props.item ? this.props.item.tags : [], step.name);
            statuses.push(status);

            const newStep = {
                id: step._id,
                type: StepStatus,
                name: step.name,
                meta: {
                    item: this.props.item,
                    flow: this.props.flow,
                    step,
                    status
                },
                disabled: () => false,
                active: () => this.props.step === step.name,
                parentIds: parentIds,
                handlers: {
                    onClick: () => this.props.onSelect && this.props.onSelect(step.name)
                }
            };

            return newStep;
        });

        firstStep.meta.status = statuslib.mood(statuses);
        steps.push(firstStep);

        return (
            <div>
                {loadIndicator}
                <JobFlow
                    theme={this.props.theme}
                    firstStep={firstStep}
                    steps={steps}
                    columnSpan={8}
                />
            </div>
        );
    }
}

FlowComponent.defaultProps = {
    firstStepName: "Collection"
};

FlowComponent.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    flow: PropTypes.object.isRequired,
    step: PropTypes.string,
    firstStepName: PropTypes.string,
    onSelect: PropTypes.func
};

FlowComponent.contextTypes = {
    router: PropTypes.object.isRequired
};

export default FlowComponent;
