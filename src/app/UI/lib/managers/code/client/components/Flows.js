
import React from "react";
import { Tab, Tabs } from "react-toolbox";
import Component from "ui-lib/component";
import {
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";
import Flow from "./Flow";
import * as queryBuilder from "ui-lib/query_builder";

class Flows extends Component {
    constructor(props) {
        super(props);

        this.addStateVariable("flow", 0);

        this.addTypeListStateVariable("flows", "flowctrl.flow", (props) => {
            const flows = props.item.tags
                .filter((tag) => tag.startsWith("step:flow:"))
                .map((tag) => tag.replace("step:flow:", ""));

            return queryBuilder.anyOf("_id", flows);
        }, true);
    }

    render() {
        this.log("render", this.props, this.state);

        if (this.state.errorAsync.value) {
            return (
                <div>{this.state.errorAsync.value}</div>
            );
        }

        if (this.state.loadingAsync.value) {
            return (
                <TALoadIndicator/>
            );
        }

        if (this.state.flows.length === 0) {
            return (
                <div>No flows found</div>
            );
        }

        if (this.state.flows.length === 1) {
            return (
                <Flow
                    theme={this.props.theme}
                    item={this.props.item}
                    itemExt={this.props.itemExt}
                    pathname={this.props.pathname}
                    flow={this.state.flows[0]}
                    step={this.props.step}
                />
            );
        }

        return (
            <Tabs
                index={this.state.flow.value}
                onChange={this.state.flow.set}
                fixed={true}
            >
                {this.state.flows.map((flow) => (
                    <Tab
                        label={flow._id}
                        key={flow._id}
                    >
                        <Flow
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
}

Flows.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    itemExt: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    step: React.PropTypes.object.isRequired
};

export default Flows;
