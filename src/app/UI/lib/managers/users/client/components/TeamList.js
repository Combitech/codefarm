
import React from "react";
import Component from "ui-lib/component";
import List from "./List";
import TeamListItem from "./TeamListItem";

class UserList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <List
                ListItemComponent={TeamListItem}
                {...this.props}
            />
        );
    }
}

UserList.propTypes = {
    theme: React.PropTypes.object,
    pathname: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

UserList.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default UserList;
