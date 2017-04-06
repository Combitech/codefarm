
import React from "react";
import { ListCards } from "ui-components/type_admin";
import Observable from "ui-observables/paged_user_list";

class UserList extends React.PureComponent {
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

UserList.propTypes = {
    theme: React.PropTypes.object,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

export default UserList;
