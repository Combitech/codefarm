
import React from "react";
import moment from "moment";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import { StepStatus, Flow as JobFlow } from "ui-components/flow";
import { Loading } from "ui-components/layout";
import statuslib from "ui-lib/statuslib";
import TypeList from "ui-observables/type_list";
import StepListObservable from "ui-observables/recursive_step_list";

class Flow extends LightComponent {
    constructor(props) {
        super(props);

        this.steps = new StepListObservable({
            flowId: props.flow._id,
            subscribe: false
        });

        this.jobList = new TypeList({
            type: "exec.job",
            query: this.getQuery(props)
        });

        this.state = {
            steps: this.steps.value.getValue(),
            stepsState: this.steps.state.getValue(),
            jobs: this.jobList.value.getValue(),
            jobsState: this.jobList.state.getValue()
        };
    }

    getQuery(props) {
        const ids = props.item.refs
        .filter((ref) => ref.type === "exec.job")
        .map((ref) => ref.id);

        return ids.length > 0 ? { _id: { $in: ids } } : false;
    }

    componentDidMount() {
        this.addDisposable(this.steps.start());

        this.addDisposable(this.steps.value.subscribe((steps) => this.setState({ steps })));
        this.addDisposable(this.steps.state.subscribe((stepsState) => this.setState({ stepsState })));

        this.addDisposable(this.jobList.start());
        this.addDisposable(this.jobList.value.subscribe((jobs) => this.setState({ jobs })));
        this.addDisposable(this.jobList.state.subscribe((jobsState) => this.setState({ jobsState })));
    }

    componentWillReceiveProps(nextProps) {
        this.steps.setOpts({
            flowId: nextProps.flow._id
        });

        this.jobList.setOpts({
            type: "exec.job",
            query: this.getQuery(nextProps)
        });
    }

    getJobStatus(jobs, name) {
        const matchedJobs = jobs.filter((job) => job.name === name);

        if (matchedJobs.length === 0) {
            return false;
        }

        matchedJobs.sort((a, b) => moment(a.created).isBefore(b.created) ? 1 : -1);

        return matchedJobs[0].status;
    }

    render() {
        this.log("render", this.props, this.state);

        if (this.state.stepsState === ObservableDataStates.LOADING) {
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

        const statuses = [];
        const jobs = this.state.jobs.toJS();
        const steps = this.state.steps.toJS().map((step) => {
            const parentIds = step.parentSteps.slice(0);

            if (parentIds.length === 0) {
                parentIds.push(firstStep.id);
            }

            const status = this.getJobStatus(jobs, step.name) || statuslib.guess(this.props.item, step.name);

            statuses.push(status);

            return {
                id: step._id,
                type: StepStatus,
                name: step.name,
                meta: {
                    item: this.props.item,
                    flow: this.props.flow,
                    step: step,
                    status: status
                },
                disabled: () => false,
                active: () => this.props.step === step.name,
                parentIds: parentIds,
                handlers: {
                    onClick: () => this.props.onStepSelect && this.props.onStepSelect(step.name)
                }
            };
        });

        firstStep.meta.status = statuslib.mood(statuses);

        steps.push(firstStep);

        return (
            <JobFlow
                steps={steps}
                columnSpan={8}
            />
        );
    }
}

Flow.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    flow: PropTypes.object.isRequired,
    step: PropTypes.string,
    onStepSelect: PropTypes.func
};

export default Flow;
