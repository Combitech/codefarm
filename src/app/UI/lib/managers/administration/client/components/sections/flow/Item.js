
import React from "react";
import Component from "ui-lib/component";
import {
    Section as TASection,
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";
import Chip from "react-toolbox/lib/chip";
import { Row, Col } from "react-flexbox-grid";
import Flow from "./Flow";
import theme from "../../theme.scss";

class Item extends Component {
    constructor(props) {
        super(props);

        this.addStateVariable("selected", this.props.context.value.parentSteps || []);

        this.addTypeListStateVariable("steps", "flowctrl.step", (props) => ({
            "flow.id": props.item._id
        }), true);
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
                    steps={this.state.steps}
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
