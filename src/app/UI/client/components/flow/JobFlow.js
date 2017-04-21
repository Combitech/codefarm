
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import statusIcons from "ui-lib/status_icons";
import Flow from "./Flow";
import moment from "moment";

class JobFlow extends LightComponent {
    render() {
        this.log("render", this.props, JSON.stringify(this.state, null, 2));

        const statuses = new Set();

        for (const step of this.props.steps) {
            // Skip first step
            if (step.id === this.props.firstStep.id) {
                continue;
            }
            const jobRefs = this.props.jobRefs.filter((ref) => ref.name === step.name);

            let status = false;
            let job = false;
            if (jobRefs.length > 0) {
                jobRefs.sort((a, b) => moment(a.data.created).isBefore(b.data.created) ? 1 : -1);
                job = jobRefs[0] ? jobRefs[0].data : false;
                if (job) {
                    status = job.status;
                }
            }
            if (!status) {
                // Step didn't have a job so check tag script
                const tags = step.meta.item.tags;

                for (const s of Object.keys(statusIcons)) {
                    if (tags.includes(`step:${step.name}:${s}`)) {
                        status = s;
                        break;
                    }
                }
            }

            statuses.add(status || "unknown");

            step.meta.status = status;
            step.meta.job = job;
        }

        // console.log("STATUSES", statuses);

        if (statuses.has("fail") || statuses.has("aborted")) {
            this.props.firstStep.meta.status = "unhappy";
        } else if (statuses.has("unknown") || statuses.has("allocated") || statuses.has("queued") || statuses.has("ongoing")) {
            this.props.firstStep.meta.status = "neutral";
        } else if (statuses.has("success") || statuses.has("skip")) {
            this.props.firstStep.meta.status = "happy";
        }

        return (
            <Flow
                theme={this.props.theme}
                steps={this.props.steps}
                columnSpan={8}
            />
        );
    }
}

JobFlow.propTypes = {
    theme: PropTypes.object,
    jobRefs: PropTypes.array.isRequired,
    steps: PropTypes.array.isRequired,
    firstStep: PropTypes.object
};

JobFlow.contextTypes = {
    router: PropTypes.object.isRequired
};

export default JobFlow;
