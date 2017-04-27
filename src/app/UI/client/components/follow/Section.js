
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import { JobView } from "ui-components/data_view";
import { Loading } from "ui-components/layout";
import OverviewSection from "./sections/Overview";
import TypeItem from "ui-observables/type_item";

class Section extends LightComponent {
    constructor(props) {
        super(props);

        this.job = new TypeItem({
            type: "exec.job",
            id: props.selected
        });

        this.state = {
            job: this.job.value.getValue(),
            jobState: this.job.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.job.start());
        this.addDisposable(this.job.value.subscribe((job) => this.setState({ job })));
        this.addDisposable(this.job.state.subscribe((jobState) => this.setState({ jobState })));
    }

    componentWillReceiveProps(nextProps) {
        this.job.setOpts({
            type: "exec.job",
            id: nextProps.selected
        });
    }

    render() {
        this.log("render", this.props, this.state);

        if (this.state.jobState === ObservableDataStates.LOADING) {
            return (
                <Loading />
            );
        }

        if (this.props.selected) {
            return (
                <JobView
                    theme={this.props.theme}
                    item={this.state.job.toJS()}
                />
            );
        }

        return (
            <OverviewSection
                theme={this.props.theme}
                item={this.props.item}
            />
        );
    }
}

Section.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    selected: PropTypes.string
};

export default Section;
