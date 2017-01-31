
import React from "react";
import Component from "ui-lib/component";
import Chip from "react-toolbox/lib/chip";
import { Row, Col } from "react-flexbox-grid";
import {
    Section as TASection
} from "ui-components/type_admin";

class BaselineItem extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        this.log("render", this.props, this.state);

        return (
            <TASection
                controls={this.props.controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <div className={this.props.theme.container}>
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
                </div>
            </TASection>
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
