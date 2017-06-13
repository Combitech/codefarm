
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { Row, Col } from "react-flexbox-grid";
import {
    Section as TASection,
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";
import Flow from "./Flow";
import { Flows } from "ui-components/flow";
import { BaselineCard } from "ui-components/data_card";
import BaselineFlowsResolve from "ui-observables/baseline_flows_resolve";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import LocationQuery from "ui-observables/location_query";

class BaselineItem extends LightComponent {
    constructor(props) {
        super(props);

        this.flows = new BaselineFlowsResolve({
            baselineName: props.item.name,
            subscribe: false
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
            baselineName: nextProps.item.name
        });
    }

    render() {
        this.log("render", this.props, JSON.stringify(this.state, null, 2));

        let loadIndicator;
        if (this.state.flowsState === ObservableDataStates.LOADING) {
            loadIndicator = (
                <TALoadIndicator
                    theme={this.props.theme}
                />
            );
        }

        const flows = this.state.flows.get("_id") ? this.state.flows.toJS() : false;
        const step = this.state.params.toJS().step || "";

        return (
            <div>
                <TASection
                    controls={this.props.controls}
                    breadcrumbs={this.props.breadcrumbs}
                    menuItems={this.props.menuItems}
                >
                    {loadIndicator}
                    {flows &&
                        <div className={this.props.theme.container}>
                            <Flows
                                theme={this.props.theme}
                                item={this.props.item}
                                pathname={this.props.pathname}
                                step={step}
                                onSelect={(step) => LocationQuery.instance.setParams({ step })}
                                flows={flows.data}
                                FlowComponent={Flow}
                            />
                            <Choose>
                                <When condition={ step }>
                                    <Row>
                                        {`Selected ${step}`}
                                    </Row>
                                </When>
                                <Otherwise>
                                    <Row>
                                        <Col xs={12} md={5} className={this.props.theme.panel}>
                                            <BaselineCard
                                                item={this.props.item}
                                                expanded={true}
                                                expandable={false}
                                                clickable={false}
                                            />
                                        </Col>
                                    </Row>
                                </Otherwise>
                            </Choose>
                        </div>
                    }
                </TASection>
            </div>
        );
    }
}

BaselineItem.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    pathname: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    menuItems: PropTypes.array.isRequired
};

export default BaselineItem;
