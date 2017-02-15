
import api from "api.io/api.io-client";
import React from "react";
import Component from "ui-lib/component";
import Chip from "react-toolbox/lib/chip";
import { Row, Col } from "react-flexbox-grid";
import {
    Section as TASection,
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";
import Flow from "./Flow";
import { Flows } from "ui-components/flow";

class BaselineItem extends Component {
    constructor(props) {
        super(props);

        this.addStateVariable("step", "");

        this.addTypeItemStateVariableWithCreate("itemExt", "dataresolve.data", (props) => {
            return {
                resolver: "RefResolve",
                opts: {
                    ref: props.item.content[0],
                    spec: {
                        paths: [
                            "$[*].refs[*]"
                        ]
                    }
                }
            };
        }, true);

        this.addTypeItemStateVariableWithCreate("flows", "dataresolve.data", (props) => {
            return {
                resolver: "BaselineFlowsResolve",
                opts: {
                    baselineName: props.item.name
                }
            };
        }, false);
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

        const flows = this.state.flows ? this.state.flows.data : [];

        return (
            <div>
                {loadIndicator}
                <TASection
                    controls={this.props.controls}
                    breadcrumbs={this.props.breadcrumbs}
                >
                    <div className={this.props.theme.container}>
                        {this.state.itemExt &&
                            <Flows
                                theme={this.props.theme}
                                item={this.props.item}
                                itemExt={this.state.itemExt}
                                pathname={this.props.pathname}
                                step={this.state.step}
                                flows={flows}
                                FlowComponent={Flow}
                            />
                        }
                        {this.state.step.value ? (
                            <Row>
                                {`Selected ${this.state.step.value}`}
                            </Row>
                        ) : (
                            <Row>
                                <Col xs={12} md={5} className={this.props.theme.panel}>
                                    <div className={this.props.theme.tags}>
                                        {this.props.item.tags.map((tag) => (
                                            <Chip key={tag}>{tag}</Chip>
                                        ))}
                                    </div>
                                    <pre>
                                        {JSON.stringify(this.props.item, null, 2)}
                                    </pre>
                                </Col>
                            </Row>
                        )}
                    </div>
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
