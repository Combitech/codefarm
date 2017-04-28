
import React from "react";
import PropTypes from "prop-types";
import { ListCards } from "ui-components/type_admin";
import Observable from "ui-observables/paged_team_list";

class TeamList extends React.PureComponent {
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

TeamList.propTypes = {
    theme: PropTypes.object,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    menuItems: PropTypes.array.isRequired
};

export default TeamList;
