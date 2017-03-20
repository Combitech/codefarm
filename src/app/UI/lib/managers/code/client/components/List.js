
import React from "react";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import Dropdown from "react-toolbox/lib/dropdown";
import { IconMenu, MenuItem } from "react-toolbox/lib/menu";
import StepListObservable from "ui-observables/step_list";
import {
    Section as TASection
} from "ui-components/type_admin";
import theme from "./theme.scss";
import LocationQuery from "ui-observables/location_query";
import List from "./list/List";
import stateVar from "ui-lib/state_var";
import FlowList from "../observables/flow_list";
import { Container, Header } from "ui-components/layout";

class ListTabs extends LightComponent {
    constructor(props) {
        super(props);

        this.flows = new FlowList({
            repositoryId: this.props.item._id
        });

        this.steps = new StepListObservable({
            flowId: "",
            visible: true,
            sortOn: "created",
            sortDesc: false,
            subscribe: false
        });

        this.state = {
            submittedExpanded: stateVar(this, "submittedExpanded", true),
            params: LocationQuery.instance.params.getValue(),
            filter: "",
            steps: this.steps.value.getValue(),
            flows: this.flows.value.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.flows.start());
        this.addDisposable(this.flows.value.subscribe((flows) => {
            if (this.steps.opts.getValue().toJS().flowId === "") {
                this.steps.setOpts({ flowId: flows.toJS()[0] || "" });
            }

            this.setState({ flows });
        }));

        this.addDisposable(this.steps.start());
        this.addDisposable(this.steps.value.subscribe((steps) => this.setState({ steps })));

        this.addDisposable(LocationQuery.instance.params.subscribe((params) => this.setState({ params })));
    }

    setMode(mode) {
        LocationQuery.instance.setParams({ mode });
    }

    render() {
        this.log("render", this.props, this.state);

        const controls = this.props.controls.slice(0);

        controls.push((
            <IconMenu
                key="mode"
                className={this.props.theme.button}
                icon="more_vert"
                menuRipple={true}
                selectable={true}
                selected={this.state.params.get("mode") || null}
                onSelect={(value) => this.setMode(value)}
            >
                <MenuItem value={null} caption="Show active" />
                <MenuItem value="abandoned" caption="Show abandoned" />
            </IconMenu>
        ));

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
                    value={this.steps.opts.getValue().toJS().flowId}
                    onChange={(flowId) => this.steps.setOpts({ flowId })}
                  />
            ));
        }

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <Container>
                    <Choose>
                        <When condition={!this.state.params.get("mode")}>
                            <Header label="Submitted" />
                            <List
                                key={"submitted"}
                                theme={theme}
                                repositoryId={this.props.item._id}
                                revisionStatus="submitted"
                                filter={this.state.filter}
                                pathname={this.props.pathname}
                                limit={0}
                                steps={this.state.steps}
                            />

                            <Header label="Merged" />
                            <List
                                key={"merged"}
                                theme={theme}
                                repositoryId={this.props.item._id}
                                revisionStatus="merged"
                                filter={this.state.filter}
                                pathname={this.props.pathname}
                                limit={30}
                                steps={this.state.steps}
                            />
                        </When>
                        <When condition={this.state.params.get("mode") === "abandoned"}>
                            <Header label="Abandoned" />
                            <List
                                key={"abandoned"}
                                theme={theme}
                                repositoryId={this.props.item._id}
                                revisionStatus="abandoned"
                                filter={this.state.filter}
                                pathname={this.props.pathname}
                                limit={10}
                                steps={this.state.steps}
                            />
                        </When>
                    </Choose>
                </Container>
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
