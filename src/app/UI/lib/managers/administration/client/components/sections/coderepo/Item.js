
import React from "react";
import LightComponent from "ui-lib/light_component";
import Tags from "ui-components/tags";
import { Row, Col } from "react-flexbox-grid";
import {
    Section as TASection,
    PagedList as TAPagedList
} from "ui-components/type_admin";

class Item extends LightComponent {
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
                            <h6 className={this.props.theme.title}>Properties</h6>
                            <table className={this.props.theme.properties}>
                                <tbody>
                                    <tr>
                                        <td>Backend</td>
                                        <td>{this.props.item.backend}</td>
                                    </tr>
                                    <tr>
                                        <td>Tags</td>
                                        <td>
                                            <Tags list={this.props.item.tags} />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </Col>
                        <Col xs={12} md={7} className={this.props.theme.panel}>
                            <h6 className={this.props.theme.title}>Revisions</h6>
                            <TAPagedList
                                type="coderepo.revision"
                                query={{ repository: this.props.item._id }}
                                limit={10}
                            />
                        </Col>
                    </Row>
                </div>
            </TASection>
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
