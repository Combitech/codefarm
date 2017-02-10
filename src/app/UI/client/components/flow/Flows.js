
import React from "react";
import { Tab, Tabs } from "react-toolbox";
import Component from "ui-lib/component";
import {
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";

class Flows extends Component {
    constructor(props) {
        super(props);

        this.addStateVariable("flow", 0);
    }

    render() {
        this.log("render", this.props, this.state);

        if (this.state.errorAsync.value) {
            return (
                <div>{this.state.errorAsync.value}</div>
            );
        }

        let loadIndicator;
        if (this.state.loadingAsync.value) {
            loadIndicator = (
                <TALoadIndicator/>
            );
        }

        let flowsContent;
        if (this.props.flows.length === 0) {
            flowsContent = (
                <div>No flows found</div>
            );
        } else if (this.props.flows.length === 1) {
            flowsContent = (
                <this.props.FlowComponent
                    theme={this.props.theme}
                    item={this.props.item}
                    itemExt={this.props.itemExt}
                    pathname={this.props.pathname}
                    flow={this.props.flows[0]}
                    step={this.props.step}
                />
            );
        } else {
            flowsContent = (
                <Tabs
                    index={this.state.flow.value}
                    onChange={this.state.flow.set}
                    fixed={true}
                >
                    {this.props.flows.map((flow) => (
                        <Tab
                            label={flow._id}
                            key={flow._id}
                        >
                            <this.props.FlowComponent
                                theme={this.props.theme}
                                item={this.props.item}
                                itemExt={this.props.itemExt}
                                pathname={this.props.pathname}
                                flow={flow}
                                step={this.props.step}
                            />
                        </Tab>
                    ))}
                </Tabs>
            );
        }

        return (
            <div className={this.props.theme.flow}>
                {loadIndicator}
                {flowsContent}
            </div>
        );
    }
}

Flows.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    itemExt: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    step: React.PropTypes.object.isRequired,
    flows: React.PropTypes.array,
    FlowComponent: React.PropTypes.func.isRequired
};

export default Flows;
