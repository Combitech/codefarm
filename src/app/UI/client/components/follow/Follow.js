
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import FlowList from "ui-observables/flow_list";
import LocationQuery from "ui-observables/location_query";
import { Flows } from "ui-components/flow";
import { Loading } from "ui-components/layout";
import Flow from "./Flow";
import Section from "./Section";
import TypeList from "ui-observables/type_list";

class Follow extends LightComponent {
    constructor(props) {
        super(props);

        this.jobList = new TypeList({
            type: "exec.job",
            query: this.getQuery(props)
        });

        this.flows = new FlowList({
            tags: props.item.tags
        });

        this.state = {
            params: LocationQuery.instance.params.getValue(),
            flows: this.flows.value.getValue(),
            flowsState: this.flows.state.getValue(),
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
        this.addDisposable(this.flows.start());

        this.addDisposable(this.flows.value.subscribe((flows) => this.setState({ flows })));
        this.addDisposable(this.flows.state.subscribe((flowsState) => this.setState({ flowsState })));

        this.addDisposable(LocationQuery.instance.params.subscribe((params) => this.setState({ params })));

        this.addDisposable(this.jobList.start());
        this.addDisposable(this.jobList.value.subscribe((jobs) => this.setState({ jobs })));
        this.addDisposable(this.jobList.state.subscribe((jobsState) => this.setState({ jobsState })));
    }

    componentWillReceiveProps(nextProps) {
        this.flows.setOpts({
            tags: nextProps.item.tags
        });

        this.jobList.setOpts({
            type: "exec.job",
            query: this.getQuery(nextProps)
        });
    }

    render() {
        this.log("render", this.props, this.state);

        const loading = this.state.flowsState === ObservableDataStates.LOADING || this.state.jobsState === ObservableDataStates.LOADING;
        const flows = this.state.flows.toJS();

        return (
            <div className={this.props.theme.container}>
                <Loading show={loading} />
                <Flows
                    theme={this.props.theme}
                    item={this.props.item}
                    jobs={this.state.jobs}
                    pathname={this.props.pathname}
                    step={this.state.params.toJS().step || ""}
                    onStepSelect={(step) => LocationQuery.instance.setParams({ step })}
                    flows={flows}
                    FlowComponent={Flow}
                />
                <Section
                    theme={this.props.theme}
                    item={this.props.item}
                    pathname={this.props.pathname}
                    step={this.state.params.toJS().step || ""}
                    label={this.props.label}
                />
            </div>
        );
    }
}

Follow.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    pathname: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
};

export default Follow;
