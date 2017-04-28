
import React from "react";
import PropTypes from "prop-types";
import { ListCards } from "ui-components/type_admin";
import Observable from "ui-observables/paged_coderepository_list";

class CodeRepositoryList extends React.PureComponent {
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

CodeRepositoryList.propTypes = {
    theme: PropTypes.object,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    menuItems: PropTypes.array.isRequired
};

export default CodeRepositoryList;
