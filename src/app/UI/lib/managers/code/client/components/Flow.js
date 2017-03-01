
import React from "react";
import LightComponent from "ui-lib/light_component";
import { JobFlow, StepStatus } from "ui-components/flow";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import { ensureArray } from "misc";
import StepListObservable from "ui-observables/step_list";
import {
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";

class FlowComponent extends LightComponent {
    constructor(props) {
        super(props);

        this.steps = new StepListObservable({
            flowId: props.flow._id,
            visible: true,
            subscribe: false
        });

        this.state = {
            steps: this.steps.value.getValue(),
            state: this.steps.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.steps.start());

        this.addDisposable(this.steps.value.subscribe((steps) => this.setState({ steps })));
        this.addDisposable(this.steps.state.subscribe((state) => this.setState({ state })));
    }

    componentWillReceiveProps(nextProps) {
        this.steps.setOpts({
            flowId: nextProps.flow._id
        });
    }

    render() {
        this.log("render", this.props, JSON.stringify(this.state, null, 2));

        if (this.state.state === ObservableDataStates.LOADING) {
            return (
                <TALoadIndicator
                    theme={this.props.theme}
                />
            );
        }

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

        const steps = this.state.steps.toJS().map((step) => {
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
