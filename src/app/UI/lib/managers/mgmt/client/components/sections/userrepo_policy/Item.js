
import React from "react";
import { Row, Col } from "react-flexbox-grid";
import DateTime from "ui-components/datetime";
import Tags from "ui-components/tags";
import {
    Section as TASection
} from "ui-components/type_admin";
import LightComponent from "ui-lib/light_component";

class Item extends LightComponent {
    render() {
        console.log("ItemLocal-RENDER", this.props);

        return (
            <TASection
                controls={this.props.controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <div className={this.props.theme.container}>
                    <Row>
                        <Col xs={12} className={this.props.theme.panel}>
                            <h6 className={this.props.theme.title}>Properties</h6>
                            <table className={this.props.theme.properties}>
                                <tbody>
                                    <tr>
                                        <td>Name</td>
                                        <td>{this.props.item._id}</td>
                                    </tr>
                                    <tr>
                                        <td>Description</td>
                                        <td>{this.props.item.description}</td>
                                    </tr>
                                    <tr>
                                        <td>Privileges</td>
                                        <td>
                                            <Tags list={this.props.item.privileges} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Created</td>
                                        <td>
                                            <DateTime
                                                value={this.props.item.created}
                                                niceDate={true}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Modified</td>
                                        <td>
                                            <DateTime
                                                value={this.props.item.saved}
                                                niceDate={true}
                                            />
                                        </td>
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
