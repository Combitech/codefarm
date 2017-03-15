
import React from "react";
import { Row, Col } from "react-flexbox-grid";
import LightComponent from "ui-lib/light_component";
import {
    Section as TASection,
    List as TAList,
    ControlButton as TAControlButton
} from "ui-components/type_admin";
import CollaboratorAvatar from "ui-components/collaborator_avatar";
import DateTime from "ui-components/datetime";
import Tags from "ui-components/tags";
import TeamListItem from "./TeamListItem";
import PolicyListItem from "./PolicyListItem";
import * as pathBuilder from "ui-lib/path_builder";
import * as queryBuilder from "ui-lib/query_builder";
import theme from "./theme.scss";
import ActiveUser from "ui-observables/active_user";
import { isTokenValidForAccess } from "auth/lib/util";

class Item extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            activeUser: ActiveUser.instance.user.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(ActiveUser.instance.user.subscribe((activeUser) => this.setState({ activeUser })));
    }

    render() {
        this.log("render", this.props);

        const isSignedInUser = this.state.activeUser.get("id") === this.props.item._id;
        const isSetPoliciesGranted = isTokenValidForAccess(this.state.activeUser.get("priv").toJS(), "userrepo.user", "setpolicies", { throwOnError: false });

        const controls = this.props.controls.slice(0);
        controls.push((
            <TAControlButton
                disabled={!isSignedInUser}
                key="setpassword"
                label="Update password"
                onClick={() => this.context.router.push({
                    pathname: `${this.props.pathname}/updatepassword`
                })}
            />
        ));

        controls.push((
            <TAControlButton
                disabled={!isSetPoliciesGranted}
                key="setpolicies"
                label="Update policies"
                onClick={() => this.context.router.push({
                    pathname: `${this.props.pathname}/updatepolicies`
                })}
            />
        ));

        let currentUserLabel;
        if (isSignedInUser) {
            currentUserLabel = (
                <div className={this.props.theme.currentUserLabel}>
                    Current user
                </div>
            );
        }

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
                                    <Tags list={this.props.item.tags} />
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
                                            <td>{this.props.item._id}{currentUserLabel}</td>
                                        </tr>
                                        <tr>
                                            <td>Name</td>
                                            <td>{this.props.item.name}</td>
                                        </tr>
                                        <tr>
                                            <td>Emails</td>
                                            <td>{this.props.item.email.join(", ")}</td>
                                        </tr>
                                        <tr>
                                            <td>Phone</td>
                                            <td>{this.props.item.telephone}</td>
                                        </tr>
                                        <tr>
                                            <td>Webpage</td>
                                            <td>{this.props.item.webpage}</td>
                                        </tr>
                                        <tr>
                                            <td>Public keys</td>
                                            <td>{this.props.item.numKeys} uploaded</td>
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
                                    </tbody>
                                </table>
                                <h6 className={this.props.theme.title}>Teams</h6>
                                <TAList
                                    type="userrepo.team"
                                    query={queryBuilder.anyOf("_id", this.props.item.teams)}
                                    ListItemComponent={TeamListItem}
                                    onSelect={(item) => {
                                        this.context.router.push({
                                            pathname: pathBuilder.fromType("userrepo.team", item)
                                        });
                                    }}
                                />
                            <h6 className={this.props.theme.title}>Granted access policies</h6>
                                <TAList
                                    type="userrepo.policy"
                                    query={queryBuilder.anyOf("_id", this.props.item.policyRefs.map((ref) => ref.id))}
                                    ListItemComponent={PolicyListItem}
                                    onSelect={(item) => {
                                        this.context.router.push({
                                            pathname: pathBuilder.fromType("userrepo.policy", item)
                                        });
                                    }}
                                />
                            </Col>
                            <Col xs={12} md={7} className={this.props.theme.panel}>
                                <h6 className={this.props.theme.title}>Avatar</h6>
                                <CollaboratorAvatar
                                    id={this.props.item._id}
                                    avatarType={"useravatar"}
                                    className={theme.avatarLarge}
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
