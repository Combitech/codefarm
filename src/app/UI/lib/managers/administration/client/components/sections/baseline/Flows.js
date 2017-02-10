
import api from "api.io/api.io-client";
import React from "react";
import { Tab, Tabs } from "react-toolbox";
import Component from "ui-lib/component";
import {
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";
import Flow from "./Flow";

class Flows extends Component {
    constructor(props) {
        super(props);

        this.addStateVariable("flow", 0);

        this.addTypeItemStateVariable("flows", "dataresolve.data", async (props) => {
            const result = await api.rest.post("dataresolve.data", {
                resolver: "BaselineFlowsResolve",
                opts: {
                    baselineName: props.item.name
                }
            });

            if (result.result !== "success") {
                throw new Error(result.error);
            }

            return result.data._id;
        }, false);
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

        const flows = this.state.flows && this.state.flows.data;
        let flowsContent;
        if (!flows || flows.length === 0) {
            flowsContent = (
                <div>No flows found</div>
            );
        } else if (flows.length === 1) {
            flowsContent = (
                <Flow
                    theme={this.props.theme}
                    item={this.props.item}
                    itemExt={this.props.itemExt}
                    pathname={this.props.pathname}
                    flow={flows[0]}
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
                    {flows.map((flow) => (
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

        return (
            <div>
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
    step: React.PropTypes.object.isRequired
};

export default Flows;
