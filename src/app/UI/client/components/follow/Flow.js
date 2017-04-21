
import React from "react";
import PropTypes from "prop-types";
import { ensureArray } from "misc";
import LightComponent from "ui-lib/light_component";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import StepListObservable from "ui-observables/step_list";
import { JobFlow, StepStatus } from "ui-components/flow";
import { Loading } from "ui-components/layout";

class Flow extends LightComponent {
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
        this.log("render", this.props, this.state);

        if (this.state.state === ObservableDataStates.LOADING) {
            return (<Loading />);
        }

        const firstStep = {
            id: "First",
            name: "Overview",
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
                active: () => this.props.step === step.name,
                parentIds: parentIds,
                handlers: {
                    onClick: () => this.props.onStepSelect && this.props.onStepSelect(step.name)
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

Flow.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    itemExt: PropTypes.object.isRequired,
    pathname: PropTypes.string.isRequired,
    flow: PropTypes.object.isRequired,
    step: PropTypes.string,
    onStepSelect: PropTypes.func
};

Flow.contextTypes = {
    router: PropTypes.object.isRequired
};

export default Flow;
