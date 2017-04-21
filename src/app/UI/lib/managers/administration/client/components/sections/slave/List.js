
import React from "react";
import PropTypes from "prop-types";
import { ListCards } from "ui-components/type_admin";
import Observable from "ui-observables/paged_slave_list";

class SlaveList extends React.PureComponent {
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

SlaveList.propTypes = {
    theme: PropTypes.object,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired
};

export default SlaveList;
