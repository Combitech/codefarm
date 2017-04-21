
import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import LightComponent from "ui-lib/light_component";
import OverviewSection from "./sections/Overview";
import { JobView } from "ui-components/data_view";
import StepSection from "./sections/Step";

class Section extends LightComponent {
    findJob() {
        const jobRefs = this.props.itemExt.data.refs
            .filter((ref) => ref.name === this.props.step && ref.type === "exec.job");

        if (jobRefs.length > 0) {
            jobRefs.sort((a, b) => moment(a.data.created).isBefore(b.data.created) ? 1 : -1);

            return jobRefs[0] ? jobRefs[0].data : false;
        }

        return false;
    }

    render() {
        this.log("render", this.props, this.state);

        if (!this.props.step) {
            return (
                <OverviewSection
                    theme={this.props.theme}
                    item={this.props.item}
                    itemExt={this.props.itemExt}
                    label={this.props.label}
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
    itemExt: PropTypes.object.isRequired,
    step: PropTypes.string,
    label: PropTypes.string.isRequired
};

export default Section;
