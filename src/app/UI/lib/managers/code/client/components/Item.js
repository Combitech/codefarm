
import React from "react";
import LightComponent from "ui-lib/light_component";
import DataResolve from "ui-observables/data_resolve";
import TypeList from "ui-observables/type_list";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import { Flows } from "ui-components/flow";
import Flow from "./Flow";
import Section from "./Section";
import {
    Section as TASection,
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";
import * as queryBuilder from "ui-lib/query_builder";

class Item extends LightComponent {
    constructor(props) {
        super(props, true);

        this.itemExt = new DataResolve({
            resolver: "RefResolve",
            opts: this.getItemExtOpts(props.item)
        });

        this.flows = new TypeList({
            type: "flowctrl.flow",
            query: this.getFlowsQuery(props.item)
        });

        this.state = {
            step: "",
            itemExt: this.itemExt.value.getValue(),
            itemExtState: this.itemExt.state.getValue(),
            flows: this.flows.value.getValue(),
            flowsState: this.flows.state.getValue()
        };
    }

    getItemExtOpts(item) {
        return {
            ref: {
                id: item._id,
                type: item.type
            },
            spec: {
                paths: [
                    "$.refs[*]"
                ]
            }
        };
    }

    getFlowsQuery(item) {
        return queryBuilder.anyOf("_id", item.tags
        .filter((tag) => tag.startsWith("step:flow:"))
        .map((tag) => tag.replace("step:flow:", "")));
    }

    componentDidMount() {
        this.addDisposable(this.itemExt.start());
        this.addDisposable(this.flows.start());

        this.addDisposable(this.itemExt.value.subscribe((itemExt) => this.setState({ itemExt })));
        this.addDisposable(this.itemExt.state.subscribe((itemExtState) => this.setState({ itemExtState })));
        this.addDisposable(this.flows.value.subscribe((flows) => this.setState({ flows })));
        this.addDisposable(this.flows.state.subscribe((flowsState) => this.setState({ flowsState })));
    }

    componentWillReceiveProps(nextProps) {
        this.itemExt.setOpts({
            opts: this.getItemExtOpts(nextProps.item)
        });

        this.flows.setOpts({
            opts: this.getFlowsQuery(nextProps.item)
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

        const flows = this.state.flows.toJS();
        const itemExt = this.state.itemExt.toJS()._id ? this.state.itemExt.toJS() : false;

        return (
            <div>
                {loadIndicator}
                <TASection
                    controls={this.props.controls}
                    breadcrumbs={this.props.breadcrumbs}
                >
                    {itemExt &&
                        <div className={this.props.theme.container}>
                            <Flows
                                theme={this.props.theme}
                                item={this.props.item}
                                itemExt={itemExt}
                                pathname={this.props.pathname}
                                step={this.state.step}
                                flows={flows}
                                FlowComponent={Flow}
                            />
                            <Section
                                theme={this.props.theme}
                                item={this.props.item}
                                itemExt={itemExt}
                                pathname={this.props.pathname}
                                step={this.state.step}
                            />
                        </div>
                    }
                </TASection>
            </div>
        );
    }
}

Item.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

export default Item;
