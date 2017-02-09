
import api from "api.io/api.io-client";
import React from "react";
import Component from "ui-lib/component";
import Flows from "./Flows";
import Section from "./Section";
import {
    Section as TASection,
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";

class Item extends Component {
    constructor(props) {
        super(props);

        this.addStateVariable("step", "");

        this.addTypeItemStateVariable("itemExt", "dataresolve.data", async (props) => {
            const result = await api.rest.post("dataresolve.data", {
                resolver: "RefResolve",
                opts: {
                    ref: {
                        id: props.item._id,
                        type: props.item.type
                    },
                    spec: {
                        paths: [
                            "$.refs[*]"
                        ]
                    }
                }
            });

            if (result.result !== "success") {
                throw new Error(result.error);
            }

            return result.data._id;
        }, true);
    }

    render() {
        this.log("render", this.props, JSON.stringify(this.state, null, 2));

        if (this.state.errorAsync.value) {
            return (
                <div>{this.state.errorAsync.value}</div>
            );
        }

        let loadIndicator;
        if (this.state.loadingAsync.value) {
            loadIndicator = (
                <TALoadIndicator
                    theme={this.props.theme}
                />
            );
        }

        return (
            <div>
                {loadIndicator}
                <TASection
                    controls={this.props.controls}
                    breadcrumbs={this.props.breadcrumbs}
                >
                    {this.state.itemExt &&
                        <div className={this.props.theme.container}>
                            <div className={this.props.theme.flow}>
                                <Flows
                                    theme={this.props.theme}
                                    item={this.props.item}
                                    itemExt={this.state.itemExt}
                                    pathname={this.props.pathname}
                                    step={this.state.step}
                                />
                            </div>
                            <Section
                                theme={this.props.theme}
                                item={this.props.item}
                                itemExt={this.state.itemExt}
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
