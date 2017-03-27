
import React from "react";
import LightComponent from "ui-lib/light_component";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import ExtendedItem from "ui-observables/extended_item";
import FlowList from "ui-observables/flow_list";
import LocationQuery from "ui-observables/location_query";
import { Flows } from "ui-components/flow";
import { Loading } from "ui-components/layout";
import Flow from "./Flow";
import Section from "./Section";

class Follow extends LightComponent {
    constructor(props) {
        super(props);

        this.itemExt = new ExtendedItem({
            id: props.item._id,
            type: props.item.type
        });

        this.flows = new FlowList({
            tags: props.item.tags
        });

        this.state = {
            params: LocationQuery.instance.params.getValue(),
            itemExt: this.itemExt.value.getValue(),
            itemExtState: this.itemExt.state.getValue(),
            flows: this.flows.value.getValue(),
            flowsState: this.flows.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.itemExt.start());
        this.addDisposable(this.flows.start());

        this.addDisposable(this.itemExt.value.subscribe((itemExt) => this.setState({ itemExt })));
        this.addDisposable(this.itemExt.state.subscribe((itemExtState) => this.setState({ itemExtState })));
        this.addDisposable(this.flows.value.subscribe((flows) => this.setState({ flows })));
        this.addDisposable(this.flows.state.subscribe((flowsState) => this.setState({ flowsState })));
        this.addDisposable(LocationQuery.instance.params.subscribe((params) => this.setState({ params })));
    }

    componentWillReceiveProps(nextProps) {
        this.itemExt.setOpts({
            id: nextProps.item._id,
            type: nextProps.item.type
        });

        this.flows.setOpts({
            tags: nextProps.item.tags
        });
    }

    render() {
        this.log("render", this.props, this.state);

        const loading = this.state.itemExtState === ObservableDataStates.LOADING || this.state.flowsState === ObservableDataStates.LOADING;
        const flows = this.state.flows.toJS();
        const itemExt = this.state.itemExt.get("_id") ? this.state.itemExt.toJS() : false;

        return (
            <div className={this.props.theme.container}>
                <Loading show={loading} />
                <If condition={itemExt}>
                    <Flows
                        theme={this.props.theme}
                        item={this.props.item}
                        itemExt={itemExt}
                        pathname={this.props.pathname}
                        step={this.state.params.toJS().step || ""}
                        onStepSelect={(step) => LocationQuery.instance.setParams({ step })}
                        flows={flows}
                        FlowComponent={Flow}
                    />
                    <Section
                        theme={this.props.theme}
                        item={this.props.item}
                        itemExt={itemExt}
                        pathname={this.props.pathname}
                        step={this.state.params.toJS().step || ""}
                        label={this.props.label}
                    />
                </If>
            </div>
        );
    }
}

Follow.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired
};

export default Follow;
