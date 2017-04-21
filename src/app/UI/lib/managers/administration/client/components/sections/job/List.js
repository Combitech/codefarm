
import React from "react";
import PropTypes from "prop-types";
import { ListCards } from "ui-components/type_admin";
import Observable from "ui-observables/paged_job_list";

class JobList extends React.PureComponent {
    render() {
        return (
            <ListCards
                Observable={Observable}
                linkToAdmin={true}
                {...this.props}
            />
        );
    }
}

JobList.propTypes = {
    theme: PropTypes.object,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired
};

export default JobList;
