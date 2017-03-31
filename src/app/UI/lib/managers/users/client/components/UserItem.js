
import React from "react";
import ImmutablePropTypes from "react-immutable-proptypes";
import LightComponent from "ui-lib/light_component";
import { IconMenu, MenuItem } from "react-toolbox/lib/menu";
import {
    Section as TASection
} from "ui-components/type_admin";
import { Row, Column, Header, Section } from "ui-components/layout";
import { UserCard } from "ui-components/data_card";
import { isTokenValidForAccess } from "auth/lib/util";

class Item extends LightComponent {
    render() {
        this.log("render", this.props);

        const isSignedInUser = this.props.activeUser.get("id") === this.props.item._id;
        const isSetPoliciesGranted = isTokenValidForAccess(
            this.props.activeUser.has("priv") && this.props.activeUser.get("priv").toJS(),
            "userrepo.user",
            "setpolicies",
            { throwOnError: false }
        );
        const isSetTeamsGranted = isTokenValidForAccess(
            this.props.activeUser.has("priv") && this.props.activeUser.get("priv").toJS(),
            "userrepo.user",
            "setteams",
            { throwOnError: false }
        );
        const isUploadAvatarGranted = isTokenValidForAccess(
            this.props.activeUser.has("priv") && this.props.activeUser.get("priv").toJS(),
            "userrepo.useravatar",
            "upload",
            { throwOnError: false }
        );

        const controls = [];

        controls.push((
            <IconMenu
                key="menu"
                className={this.props.theme.button}
                icon="more_vert"
                menuRipple={true}
            >
                <If condition={isUploadAvatarGranted}>
                    <MenuItem
                        caption="Edit tags"
                        onClick={() => this.context.router.push({
                            pathname: `${this.props.pathname}/tags`
                        })}
                    />
                </If>

                <If condition={isSignedInUser}>
                    <MenuItem
                        caption="Update password"
                        onClick={() => this.context.router.push({
                            pathname: `${this.props.pathname}/updatepassword`
                        })}
                    />
                </If>

                <If condition={isSignedInUser}>
                    <MenuItem
                        caption="Add public key"
                        onClick={() => this.context.router.push({
                            pathname: `${this.props.pathname}/addkey`
                        })}
                    />
                </If>

                <If condition={isSetPoliciesGranted}>
                    <MenuItem
                        caption="Update policies"
                        onClick={() => this.context.router.push({
                            pathname: `${this.props.pathname}/updatepolicies`
                        })}
                    />
                </If>

                <If condition={isSetTeamsGranted}>
                    <MenuItem
                        caption="Update teams"
                        onClick={() => this.context.router.push({
                            pathname: `${this.props.pathname}/updateteams`
                        })}
                    />
                </If>

                <If condition={isUploadAvatarGranted}>
                    <MenuItem
                        caption="Upload avatar"
                        onClick={() => this.context.router.push({
                            pathname: `${this.props.pathname}/uploadavatar`
                        })}
                    />
                </If>
            </IconMenu>
        ));

        return (
            <div>
                <TASection
                    controls={controls}
                    breadcrumbs={this.props.breadcrumbs}
                >
                    <div className={this.props.theme.container}>
                        <Row>
                            <Column xs={12} md={6}>
                                <Section>
                                    <Header label="Properties" />
                                    <UserCard
                                        theme={this.props.theme}
                                        item={this.props.item}
                                        expandable={false}
                                        expanded={true}
                                        showAdvanced={true}
                                        isCurrentSignedInUser={isSignedInUser}
                                        largeIcon={true}
                                    />
                                </Section>
                            </Column>
                            <Column xs={12} md={6}>
                            </Column>
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
    controls: React.PropTypes.array.isRequired,
    activeUser: ImmutablePropTypes.map.isRequired
};

Item.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default Item;
