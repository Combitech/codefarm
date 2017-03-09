
import React from "react";
import LightComponent from "ui-lib/light_component";
import Tags from "ui-components/tags";
import { Row, Col } from "react-flexbox-grid";
import {
    Section as TASection,
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";
import Flow from "./Flow";
import { Flows } from "ui-components/flow";
import ExtendedItem from "ui-observables/extended_item";
import BaselineFlowsResolve from "ui-observables/baseline_flows_resolve";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import LocationQuery from "ui-observables/location_query";

class BaselineItem extends LightComponent {
    constructor(props) {
        super(props);

        this.itemExt = new ExtendedItem({
            id: props.item.content[0].id[0],
            type: props.item.content[0].type
        });

        this.flows = new BaselineFlowsResolve({
            baselineName: props.item.name,
            subscribe: false
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
            id: nextProps.item.content[0].id,
            type: nextProps.item.content[0].type
        });

        this.flows.setOpts({
            baselineName: nextProps.item.name
        });
    }

    render() {
        this.log("render", this.props, JSON.stringify(this.state, null, 2));

        let loadIndicator;
        if (this.state.itemExtState === ObservableDataStates.LOADING || this.state.flowsState === ObservableDataStates.LOADING) {
            loadIndicator = (
                <TALoadIndicator
                    theme={this.props.theme}
                />
            );
        }

        const flows = this.state.flows.get("_id") ? this.state.flows.toJS() : false;
        const itemExt = this.state.itemExt.get("_id") ? this.state.itemExt.toJS() : false;
        const step = this.state.params.toJS().step || "";

        return (
            <div>
                <TASection
                    controls={this.props.controls}
                    breadcrumbs={this.props.breadcrumbs}
                >
                    {loadIndicator}
                    {itemExt && flows &&
                        <div className={this.props.theme.container}>
                            <Flows
                                theme={this.props.theme}
                                item={this.props.item}
                                itemExt={itemExt}
                                pathname={this.props.pathname}
                                step={step}
                                onStepSelect={(step) => LocationQuery.instance.setParams({ step })}
                                flows={flows.data}
                                FlowComponent={Flow}
                            />
                        {step ? (
                                <Row>
                                    {`Selected ${step}`}
                                </Row>
                            ) : (
                                <Row>
                                    <Col xs={12} md={5} className={this.props.theme.panel}>
                                        <div className={this.props.theme.tags}>
                                            <Tags list={this.props.item.tags} />
                                        </div>
                                        <pre>
                                            {JSON.stringify(this.props.item, null, 2)}
                                            {JSON.stringify(itemExt, null, 2)}
                                        </pre>
                                    </Col>
                                </Row>
                            )}
                        </div>
                    }
                </TASection>
            </div>
        );
    }
}

BaselineItem.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

export default BaselineItem;
