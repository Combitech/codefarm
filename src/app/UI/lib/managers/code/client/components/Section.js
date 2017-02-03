
import React from "react";
import Component from "ui-lib/component";
import OverviewSection from "./sections/Overview";
import JobSection from "./sections/Job";

class Section extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        this.log("render", this.props, this.state);

        if (this.props.step.value) {
            const jobRef = this.props.itemExt.data.refs.find((ref) => ref.name === this.props.step.value);

            return (
                <JobSection
                    theme={this.props.theme}
                    item={this.props.item}
                    itemExt={this.props.itemExt}
                    jobItem={jobRef.data}
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
    step: React.PropTypes.any.isRequired
};

export default Section;
