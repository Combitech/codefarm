
import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import LightComponent from "ui-lib/light_component";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import { JobView } from "ui-components/data_view";
import { Loading } from "ui-components/layout";
import OverviewSection from "./sections/Overview";
import StepSection from "./sections/Step";
import TypeList from "ui-observables/type_list";

class Section extends LightComponent {
    constructor(props) {
        super(props);

        this.jobList = new TypeList({
            type: "exec.job",
            query: this.getQuery(props)
        });

        this.state = {
            jobs: this.jobList.value.getValue(),
            jobsState: this.jobList.state.getValue()
        };
    }

    getQuery(props) {
        const ids = props.item.refs
        .filter((ref) => ref.name === props.step && ref.type === "exec.job")
        .map((ref) => ref.id);

        return ids.length > 0 ? { _id: { $in: ids } } : false;
    }

    componentDidMount() {
        this.addDisposable(this.jobList.start());
        this.addDisposable(this.jobList.value.subscribe((jobs) => this.setState({ jobs })));
        this.addDisposable(this.jobList.state.subscribe((jobsState) => this.setState({ jobsState })));
    }

    componentWillReceiveProps(nextProps) {
        this.jobList.setOpts({
            type: "exec.job",
            query: this.getQuery(nextProps)
        });
    }

    findJob() {
        const jobs = this.state.jobs.toJS();

        if (jobs.length > 0) {
            jobs.sort((a, b) => moment(a.created).isBefore(b.created) ? 1 : -1);

            return jobs[0];
        }

        return false;
    }

    render() {
        this.log("render", this.props, this.state);

        if (this.state.jobsState === ObservableDataStates.LOADING) {
            return (
                <Loading />
            );
        }

        if (!this.props.step) {
            return (
                <OverviewSection
                    theme={this.props.theme}
                    item={this.props.item}
                />
            );
        }

        const job = this.findJob();

        if (job) {
            return (
                <JobView
                    theme={this.props.theme}
                    item={job}
                />
            );
        }

        return (
            <StepSection
                theme={this.props.theme}
                item={this.props.item}
                step={this.props.step}
            />
        );
    }
}

Section.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    step: PropTypes.string
};

export default Section;
