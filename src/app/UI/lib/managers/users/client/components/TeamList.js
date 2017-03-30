
import React from "react";
import LightComponent from "ui-lib/light_component";
import List from "./List";
import TeamListObservable from "../observables/team_list";

class TeamList extends LightComponent {
    constructor(props) {
        super(props);

        this.teamList = new TeamListObservable({
            sortOn: "name",
            sortOnType: "String",
            limit: 20
        });

        this.state = {
            list: this.teamList.value.getValue(),
            state: this.teamList.state.getValue()
        };
    }

    componentDidMount() {
        this.log("componentDidMount");
        this.addDisposable(this.teamList.start());
        this.addDisposable(this.teamList.value.subscribe((list) => this.setState({ list })));
        this.addDisposable(this.teamList.state.subscribe((state) => this.setState({ state })));
    }

    render() {
        return (
            <List
                items={this.state.list}
                listObservable={this.teamList}
                {...this.props}
            />
        );
    }
}

TeamList.propTypes = {
    theme: React.PropTypes.object,
    pathname: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

TeamList.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default TeamList;
