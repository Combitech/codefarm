
import React from "react";
import LightComponent from "ui-lib/light_component";
import OverviewSection from "./sections/Overview";
import JobSection from "./sections/Job";
import NoJobSection from "./sections/NoJob";
import moment from "moment";

class Section extends LightComponent {
    constructor(props) {
        super(props);
    }

    render() {
        this.log("render", this.props, this.state);

        if (this.props.step !== "") {
            const jobRefs = this.props.itemExt.data.refs.filter((ref) => ref.name === this.props.step && ref.type === "exec.job");

            if (jobRefs.length > 0) {
                jobRefs.sort((a, b) => moment(a.data.created).isBefore(b.data.created) ? 1 : -1);

                const job = jobRefs[0] ? jobRefs[0].data : false;

                if (job) {
                    return (
                        <JobSection
                            theme={this.props.theme}
                            item={this.props.item}
                            itemExt={this.props.itemExt}
                            jobItem={job}
                        />
                    );
                }
            }

            return (
                <NoJobSection
                    theme={this.props.theme}
                    item={this.props.item}
                    itemExt={this.props.itemExt}
                    step={this.props.step}
                />
            );
        }

        return (
            <OverviewSection
                theme={this.props.theme}
                item={this.props.item}
                itemExt={this.props.itemExt}
            />
        );
    }
}

Section.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    itemExt: React.PropTypes.object.isRequired,
    step: React.PropTypes.string
};

export default Section;
