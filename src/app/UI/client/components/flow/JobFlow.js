
import React from "react";
import LightComponent from "ui-lib/light_component";
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
            if (!status && (!step.meta.step.script && step.meta.step.tagScript)) {
                // Step didn't have a job but a tag-script, check tags on revision instead
                const tags = step.meta.item.tags;
                if (tags.some((tag) => tag === `step:${step.name}:success`)) {
                    status = "success";
                } else if (tags.some((tag) => tag === `step:${step.name}:fail`)) {
                    status = "fail";
                }
            }

            statuses.add(status || "unknown");

            step.meta.status = status;
            step.meta.job = job;
        }

        console.log("STATUSES", statuses);

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
    theme: React.PropTypes.object,
    jobRefs: React.PropTypes.array.isRequired,
    steps: React.PropTypes.array.isRequired,
    firstStep: React.PropTypes.object
};

JobFlow.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default JobFlow;
