
import React from "react";
import { ListCards } from "ui-components/type_admin";
import Observable from "ui-observables/paged_userpolicy_list";

class UserPolicyList extends React.PureComponent {
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

UserPolicyList.propTypes = {
    theme: React.PropTypes.object,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

export default UserPolicyList;
