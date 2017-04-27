
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import FlowList from "ui-observables/flow_list";
import LocationQuery from "ui-observables/location_query";
import { Flows } from "ui-components/flow";
import { Loading } from "ui-components/layout";
import Flow from "./Flow";
import Section from "./Section";

class Follow extends LightComponent {
    constructor(props) {
        super(props);

        this.flows = new FlowList({
            tags: props.item.tags
        });

        this.state = {
            params: LocationQuery.instance.params.getValue(),
            flows: this.flows.value.getValue(),
            flowsState: this.flows.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.flows.start());

        this.addDisposable(this.flows.value.subscribe((flows) => this.setState({ flows })));
        this.addDisposable(this.flows.state.subscribe((flowsState) => this.setState({ flowsState })));

        this.addDisposable(LocationQuery.instance.params.subscribe((params) => this.setState({ params })));
    }

    componentWillReceiveProps(nextProps) {
        this.flows.setOpts({
            tags: nextProps.item.tags
        });
    }

    render() {
        this.log("render", this.props, this.state);

        const loading = this.state.flowsState === ObservableDataStates.LOADING;
        const flows = this.state.flows.toJS();

        return (
            <div className={this.props.theme.container}>
                <Loading show={loading} />
                <Flows
                    theme={this.props.theme}
                    item={this.props.item}
                    selected={this.state.params.toJS().job || ""}
                    onSelect={(job) => LocationQuery.instance.setParams({ job })}
                    flows={flows}
                    FlowComponent={Flow}
                />
                <Section
                    theme={this.props.theme}
                    item={this.props.item}
                    selected={this.state.params.toJS().job || ""}
                />
            </div>
        );
    }
}

Follow.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired
};

export default Follow;
