
import React from "react";
import Chip from "react-toolbox/lib/chip";
import { Row, Col } from "react-flexbox-grid";
import Component from "ui-lib/component";
import {
    Section as TASection,
    List as TAList
} from "ui-components/type_admin";
import UserListItem from "./UserListItem";
import * as pathBuilder from "ui-lib/path_builder";

class Item extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        this.log("render", this.props);

        const controls = this.props.controls.slice(0);

        return (
            <div>
                <TASection
                    controls={controls}
                    breadcrumbs={this.props.breadcrumbs}
                >
                    <div className={this.props.theme.container}>
                        <Row>
                            <Col className={this.props.theme.panel}>
                                <div className={this.props.theme.tags}>
                                    {this.props.item.tags.map((tag) => (
                                        <Chip key={tag}>{tag}</Chip>
                                    ))}
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} md={5} className={this.props.theme.panel}>
                                <h6 className={this.props.theme.title}>Properties</h6>
                                <table className={this.props.theme.properties}>
                                    <tbody>
                                        <tr>
                                            <td>ID</td>
                                            <td>{this.props.item._id}</td>
                                        </tr>
                                        <tr>
                                            <td>Name</td>
                                            <td>{this.props.item.name}</td>
                                        </tr>
                                        <tr>
                                            <td>Email</td>
                                            <td>{this.props.item.email}</td>
                                        </tr>
                                        <tr>
                                            <td>Webpage</td>
                                            <td>{this.props.item.webpage}</td>
                                        </tr>
                                        <tr>
                                            <td>Created</td>
                                            <td>{this.props.item.created}</td>
                                        </tr>
                                        <tr>
                                            <td>Modified</td>
                                            <td>{this.props.item.saved}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </Col>
                            <Col xs={12} md={7} className={this.props.theme.panel}>
                                <h6 className={this.props.theme.title}>Users</h6>
                                <TAList
                                    type="userrepo.user"
                                    query={{ teams: this.props.item._id }}
                                    ListItemComponent={UserListItem}
                                    onSelect={(item) => {
                                        this.context.router.push({
                                            pathname: pathBuilder.fromType("userrepo.user", item)
                                        });
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
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

Item.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default Item;
