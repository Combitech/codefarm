
import React from "react";
import LightComponent from "ui-lib/light_component";
import { StatusIcon } from "ui-components/status";

class NoJob extends LightComponent {
    constructor(props) {
        super(props);
    }

    render() {
        this.log("render", this.props, this.state);
        const stepName = this.props.step;

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
    step: React.PropTypes.string.isRequired
};

export default NoJob;
