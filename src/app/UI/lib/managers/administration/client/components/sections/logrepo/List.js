
import React from "react";
import { ListCards } from "ui-components/type_admin";
import Observable from "ui-observables/paged_logrepository_list";

class LogRepositoryList extends React.PureComponent {
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

LogRepositoryList.propTypes = {
    theme: React.PropTypes.object,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

export default LogRepositoryList;
