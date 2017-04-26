
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { Row, Column, Header, Section, Loading } from "ui-components/layout";
import { FlowCard } from "ui-components/data_card";
import StepListObservable from "ui-observables/step_list";
import Flow from "./flow/Flow";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import stateVar from "ui-lib/state_var";

class FlowView extends LightComponent {
    constructor(props) {
        super(props);

        this.stepList = new StepListObservable({
            flowId: props.item._id
        });

        this.state = {
            selected: stateVar(this, "selected", this.props.context.value.parentSteps || []),
            stepList: this.stepList.value.getValue(),
            stepListState: this.stepList.state.getValue()
        };
    }

    componentDidMount() {
        this.log("componentDidMount");
        this.addDisposable(this.stepList.start());
        this.addDisposable(this.stepList.value.subscribe((stepList) => this.setState({ stepList })));
        this.addDisposable(this.stepList.state.subscribe((stepListState) => this.setState({ stepListState })));
    }

    componentWillReceiveProps(nextProps) {
        this.log("componentWillReceiveProps");

        if (nextProps.flow) {
            this.stepList.setOpts({ flowId: nextProps.flow._id });
        }
    }

    render() {
        this.log("render", this.props, this.state);

        return (
            <div>
                <Row>
                    <Column xs={12} md={12}>
                        <Choose>
                            <When condition={this.state.jobsState === ObservableDataStates.LOADING}>
                                <Loading />
                            </When>
                            <Otherwise>
                                <Flow
                                    theme={this.props.theme}
                                    context={this.props.context}
                                    item={this.props.item}
                                    steps={this.state.stepList.toJS()}
                                    selected={this.state.selected}
                                />
                            </Otherwise>
                        </Choose>
                    </Column>
                </Row>
                <Row>
                    <Column xs={12} md={12}>
                        <Section>
                            <Header label="Properties" />
                            <FlowCard
                                item={this.props.item}
                                expanded={true}
                                expandable={false}
                            />
                        </Section>
                    </Column>
                </Row>
            </div>
        );
    }
}

FlowView.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object,
    context: PropTypes.object
};

export default FlowView;
