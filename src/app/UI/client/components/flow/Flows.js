
import React from "react";
import PropTypes from "prop-types";
import { Tab, Tabs } from "react-toolbox";
import LightComponent from "ui-lib/light_component";

class Flows extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            flow: 0
        };
    }

    render() {
        this.log("render", this.props, this.state);

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
                    flow={this.props.flows[0]}
                    selected={this.props.selected}
                    onSelect={this.props.onSelect}
                />
            );
        } else {
            flowsContent = (
                <Tabs
                    index={this.state.flow}
                    onChange={(flow) => this.setState({ flow })}
                    fixed={true}
                >
                    <For each="flow" of={this.props.flows}>
                        <Tab
                            label={flow._id}
                            key={flow._id}
                        >
                            <this.props.FlowComponent
                                theme={this.props.theme}
                                item={this.props.item}
                                flow={flow}
                                selected={this.props.selected}
                                onSelect={this.props.onSelect}
                            />
                        </Tab>
                    </For>
                </Tabs>
            );
        }

        return (
            <div className={this.props.theme.flow}>
                {flowsContent}
            </div>
        );
    }
}

Flows.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    selected: PropTypes.string,
    onSelect: PropTypes.func,
    flows: PropTypes.array,
    FlowComponent: PropTypes.func.isRequired
};

export default Flows;
