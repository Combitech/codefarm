
import React from "react";
import Component from "ui-lib/component";
import { StatusIcon } from "ui-components/status";

class NoJob extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        this.log("render", this.props, this.state);
        const stepName = this.props.step.value;

        const myStepTags = this.props.item.tags
            .filter((tag) => tag.startsWith(`step:${stepName}:`))
            .map((tag) => tag.replace(`step:${stepName}:`, ""));
        let stepResult = "unknown";
        if (myStepTags.some((tag) => tag === "success")) {
            stepResult = "success";
        } else if (myStepTags.some((tag) => tag === "fail")) {
            stepResult = "fail";
        }

        return (
            <div>
                <div>
                    Step {stepName}
                </div>
                <StatusIcon
                    className={this.props.theme.statusIcon}
                    status={stepResult}
                    size={48}
                />
            </div>
        );
    }
}

NoJob.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    itemExt: React.PropTypes.object.isRequired,
    step: React.PropTypes.object.isRequired
};

export default NoJob;
