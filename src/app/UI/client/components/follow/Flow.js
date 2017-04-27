
import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import LightComponent from "ui-lib/light_component";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import { StepStatus, Flow as JobFlow } from "ui-components/flow";
import { Loading } from "ui-components/layout";
import statuslib from "ui-lib/statuslib";
import StepListObservable from "ui-observables/recursive_step_list";
import ItemListObservable from "ui-observables/recursive_item_list";

class Flow extends LightComponent {
    constructor(props) {
        super(props);

        this.steps = new StepListObservable({
            flowId: props.flow._id,
            subscribe: false
        });

        this.items = new ItemListObservable({
            id: props.item._id,
            type: props.item.type
        });

        this.state = {
            steps: this.steps.value.getValue(),
            stepsState: this.steps.state.getValue(),
            items: this.items.value.getValue(),
            itemsState: this.items.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.steps.start());

        this.addDisposable(this.steps.value.subscribe((steps) => this.setState({ steps })));
        this.addDisposable(this.steps.state.subscribe((stepsState) => this.setState({ stepsState })));


        this.addDisposable(this.items.start());

        this.addDisposable(this.items.value.subscribe((items) => this.setState({ items })));
        this.addDisposable(this.items.state.subscribe((itemsState) => this.setState({ itemsState })));
    }

    componentWillReceiveProps(nextProps) {
        this.steps.setOpts({
            flowId: nextProps.flow._id
        });

        this.items.setOpts({
            id: nextProps.item._id,
            type: nextProps.item.type
        });
    }

    getItemByFlow(flowId) {
        const items = this.state.items.toJS()
            .filter((item) => item.tags.includes(`step:flow:${flowId}`));

        // TODO: Should we sort items on time or something? Or use all?
        return items[0] || false;
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
            active: () => this.props.selected === "",
            parentIds: [],
            handlers: {
                onClick: () => this.props.onSelect && this.props.onSelect(null)
            }
        };

        const statuses = [];
        const steps = this.state.steps.toJS().map((step) => {
            const parentIds = step.parentSteps.slice(0);

            if (parentIds.length === 0) {
                parentIds.push(firstStep.id);
            }

            const item = this.getItemByFlow(step.flow.id);
            const status = statuslib.fromTags(item ? item.tags : [], step.name);
            let jobId = false;

            statuses.push(status);

            if (item) {
                const jobRefs = item.refs.filter((ref) => ref.name === step.name);

                jobRefs.sort((a, b) => moment(a.created).isBefore(b.created) ? 1 : -1);

                jobId = jobRefs[0] ? jobRefs[0].id : false;
            }

            return {
                id: step._id,
                type: StepStatus,
                name: step.name,
                meta: {
                    item: item,
                    flow: this.props.flow,
                    step: step,
                    status: status
                },
                disabled: () => false,
                active: () => this.props.selected === jobId,
                parentIds: parentIds,
                handlers: {
                    onClick: () => this.props.onSelect && jobId && this.props.onSelect(jobId)
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
    selected: PropTypes.string,
    onSelect: PropTypes.func
};

export default Flow;
