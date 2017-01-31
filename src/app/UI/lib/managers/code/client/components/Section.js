
import React from "react";
import Component from "ui-lib/component";
import OverviewSection from "./sections/Overview";
import JobItem from "ui-mgr/administration/client/components/sections/job/JobItem";
import theme from "ui-components/type_admin/theme.scss";

class Section extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        this.log("render", this.props, this.state);

        if (this.props.step.value) {
            const jobRef = this.props.itemExt.data.refs.find((ref) => ref.name === this.props.step.value);

            // TODO: This is a temporary include to show something for jobs, links are broken and other stuff is not good, but it is something
            return (
                <JobItem
                    theme={theme}
                    item={jobRef.data}
                    pathname={""}
                    breadcrumbs={[]}
                    controls={[]}
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
