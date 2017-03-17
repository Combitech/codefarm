
import React from "react";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import Dropdown from "react-toolbox/lib/dropdown";
import {
    Section as TASection
} from "ui-components/type_admin";
import theme from "./theme.scss";
import LocationQuery from "ui-observables/location_query";
import List from "./list/List";
import stateVar from "ui-lib/state_var";

class ListTabs extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            submittedExpanded: stateVar(this, "submittedExpanded", true),
            params: LocationQuery.instance.params.getValue(),
            filter: ""
        };
    }

    componentDidMount() {
        this.addDisposable(LocationQuery.instance.params.subscribe((params) => this.setState({ params })));
    }

    setMode(mode) {
        LocationQuery.instance.setParams({ mode });
    }

    render() {
        this.log("render", this.props, this.state);

        const modes = [
            { value: null, label: "Show active" },
            { value: "abandoned", label: "Show abandoned" }
        ];

        const controls = this.props.controls.slice(0);

        controls.push((
            <Input
                key="filter"
                className={this.props.theme.filterInput}
                type="text"
                label="Filter list"
                name="filter"
                value={this.state.filter}
                onChange={(value) => this.setState({ filter: value })}
            />
        ));

        controls.push((
            <Dropdown
                key="mode"
                className={this.props.theme.filterInput}
                auto
                source={modes}
                value={this.state.params.get("mode") || null}
                onChange={(value) => this.setMode(value)}
              />
      ));

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <div className={this.props.theme.container}>
                    <Choose>
                        <When condition={!this.state.params.get("mode")}>
                            <div className={this.props.theme.sectionHeader}>
                                Submitted
                            </div>
                            <List
                                key={"submitted"}
                                theme={theme}
                                repositoryId={this.props.item._id}
                                revisionStatus="submitted"
                                filter={this.state.filter}
                                pathname={this.props.pathname}
                                limit={0}
                            />
                            <div className={this.props.theme.sectionHeader}>
                                Merged
                            </div>
                            <List
                                key={"merged"}
                                theme={theme}
                                repositoryId={this.props.item._id}
                                revisionStatus="merged"
                                filter={this.state.filter}
                                pathname={this.props.pathname}
                                limit={30}
                            />
                        </When>
                        <When condition={this.state.params.get("mode") === "abandoned"}>
                            <div className={this.props.theme.sectionHeader}>
                                Abandoned
                            </div>
                            <List
                                key={"abandoned"}
                                theme={theme}
                                repositoryId={this.props.item._id}
                                revisionStatus="abandoned"
                                filter={this.state.filter}
                                pathname={this.props.pathname}
                                limit={10}
                            />
                        </When>
                    </Choose>
                </div>
            </TASection>
        );
    }
}

ListTabs.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

ListTabs.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default ListTabs;
