
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
        this.log("render", this.props);

        return (
            <TASection
                controls={this.props.controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <div className={this.props.theme.container}>
                    <Row>
                        <Col xs={12} md={5} className={this.props.theme.panel}>
                            <Row className={this.props.theme.row}>
                                <Tags list={this.props.item.tags} />
                            </Row>
                            <h6 className={this.props.theme.title}>Properties</h6>
                            <table className={this.props.theme.properties}>
                                <tbody>
                                    <tr>
                                        <td>Backend</td>
                                        <td>{this.props.item.backend}</td>
                                    </tr>
                                    <tr>
                                        <td>Version Scheme</td>
                                        <td>{this.props.item.versionScheme}</td>
                                    </tr>
                                    <tr>
                                        <td>Hash Algorithms</td>
                                        <td>{this.props.item.hashAlgorithms.join(", ")}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Col>
                        <Col xs={12} md={7} className={this.props.theme.panel}>
                            <h6 className={this.props.theme.title}>Artifacts</h6>
                            <TAPagedList
                                type="artifactrepo.artifact"
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
