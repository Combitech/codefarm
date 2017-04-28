
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import Dropdown from "react-toolbox/lib/dropdown";
import { Container } from "ui-components/layout";
import { ArtifactRepositoryCard } from "ui-components/data_card";
import { Section as TASection, MenuItem } from "ui-components/type_admin";
import { List } from "ui-components/follow";
import RowComponent from "./list/Row";
import HeaderComponent from "./list/Header";
import LocationQuery from "ui-observables/location_query";
import FlowList from "ui-observables/artifact_repository_flows";
import ArtifactList from "ui-observables/paged_artifact_list";

class ListTabs extends LightComponent {
    constructor(props) {
        super(props);

        this.flows = new FlowList({
            repositoryId: this.props.item._id
        });

        this.state = {
            params: LocationQuery.instance.params.getValue(),
            filter: "",
            flows: this.flows.value.getValue(),
            flowId: ""
        };
    }

    componentDidMount() {
        this.addDisposable(this.flows.start());
        this.addDisposable(this.flows.value.subscribe((flows) => {
            const state = { flows };

            if (!this.state.flowId && flows.first()) {
                state.flowId = flows.first();
            }

            this.setState(state);
        }));

        this.addDisposable(LocationQuery.instance.params.subscribe((params) => this.setState({ params })));
    }

    setView(view) {
        LocationQuery.instance.setParams({ view });
    }

    render() {
        this.log("render", this.props, this.state);

        const controls = this.props.controls.slice(0);
        const menuItems = this.props.menuItems.slice(0);

        menuItems.push(
            <MenuItem
                key="active"
                caption="Show list"
                onClick={() => this.setView(null)}
            />
        );

        menuItems.push(
            <MenuItem
                key="info"
                caption="Show information"
                onClick={() => this.setView("info")}
            />
        );

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

        if (this.state.flows.size > 1) {
            controls.push((
                <Dropdown
                    key="flows"
                    className={this.props.theme.dropdown}
                    auto
                    source={this.state.flows.toJS().map((flowId) => ({ label: flowId, value: flowId }))}
                    value={this.state.flowId}
                    onChange={(flowId) => this.setState({ flowId })}
                  />
            ));
        }

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
                menuItems={menuItems}
            >
                <Container>
                    <Choose>
                        <When condition={this.state.params.get("view") === "info"}>
                            <ArtifactRepositoryCard
                                item={this.props.item}
                                expanded={true}
                                expandable={false}
                            />
                        </When>
                        <Otherwise>
                            <List
                                key={"list"}
                                ObservableList={ArtifactList}
                                HeaderComponent={HeaderComponent}
                                RowComponent={RowComponent}
                                query={{
                                    repository: this.props.item._id
                                }}
                                flowId={this.state.flowId}
                                filter={this.state.filter}
                                pathname={this.props.pathname}
                            />
                        </Otherwise>
                    </Choose>
                </Container>
            </TASection>
        );
    }
}

ListTabs.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object,
    pathname: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    menuItems: PropTypes.array.isRequired
};

export default ListTabs;
