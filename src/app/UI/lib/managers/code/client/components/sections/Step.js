
import React from "react";
import statusText from "ui-lib/status_text";
import { Header } from "ui-components/layout";
import { StepResultCard } from "ui-components/data_card";

class Step extends React.PureComponent {
    render() {
        const tags = this.props.item.tags
            .filter((tag) => tag.startsWith(`step:${this.props.step}:`))
            .map((tag) => tag.replace(`step:${this.props.step}:`, ""));

        const item = {
            name: this.props.step,
            status: "unknown"
        };

        for (const status of Object.keys(statusText)) {
            if (tags.includes(status)) {
                item.status = status;
                break;
            }
        }

        return (
            <div>
                <Header label="Step" />
                <StepResultCard
                    item={item}
                    expanded={true}
                    expandable={false}
                />
            </div>
        );
    }
}

Step.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    step: React.PropTypes.string.isRequired
};

export default Step;
