
import React from "react";
import LightComponent from "ui-lib/light_component";
import {
    Section as TASection,
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";
import Chip from "react-toolbox/lib/chip";
import { Row, Col } from "react-flexbox-grid";
import stateVar from "ui-lib/state_var";
import Flow from "./Flow";
import StepListObservable from "ui-observables/step_list";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import theme from "../../theme.scss";

class Item extends LightComponent {
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

        if (this.state.state === ObservableDataStates.LOADING) {
            return (
                <TALoadIndicator />
            );
        }

        return (
            <TASection
                controls={this.props.controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <div className={this.props.theme.container}>
                    <Row>
                        <Col xs={12} md={12} className={this.props.theme.panel}>
                            <div className={this.props.theme.tags}>
                                {this.props.item.tags.map((tag) => (
                                    <Chip key={tag}>{tag}</Chip>
                                ))}
                            </div>
                            <p>
                                {this.props.item.description}
                            </p>
                        </Col>
                    </Row>
                </div>
                <Flow
                    theme={theme}
                    context={this.props.context}
                    item={this.props.item}
                    pathname={this.props.pathname}
                    steps={this.state.stepList.toJS()}
                    selected={this.state.selected}
                />
            </TASection>
        );
    }
}

Item.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired,
    context: React.PropTypes.object.isRequired
};

export default Item;
