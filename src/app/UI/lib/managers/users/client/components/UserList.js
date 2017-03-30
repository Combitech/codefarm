
import React from "react";
import LightComponent from "ui-lib/light_component";
import List from "./List";
import UserListObservable from "../observables/user_list";

class UserList extends LightComponent {
    constructor(props) {
        super(props);

        this.userList = new UserListObservable({
            sortOn: "name",
            sortOnType: "String",
            limit: 20
        });

        this.state = {
            list: this.userList.value.getValue(),
            state: this.userList.state.getValue()
        };
    }

    componentDidMount() {
        this.log("componentDidMount");
        this.addDisposable(this.userList.start());
        this.addDisposable(this.userList.value.subscribe((list) => this.setState({ list })));
        this.addDisposable(this.userList.state.subscribe((state) => this.setState({ state })));
    }

    render() {
        return (
            <List
                items={this.state.list}
                listObservable={this.userList}
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
