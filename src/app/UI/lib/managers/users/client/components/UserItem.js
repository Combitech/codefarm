
import React from "react";
import Immutable from "immutable";
import ImmutablePropTypes from "react-immutable-proptypes";
import LightComponent from "ui-lib/light_component";
import { IconMenu, MenuItem } from "react-toolbox/lib/menu";
import {
    Section as TASection
} from "ui-components/type_admin";
import { Row, Column, Header, Section } from "ui-components/layout";
import { CardList, UserCard, TeamCard, PolicyCard } from "ui-components/data_card";
import * as queryBuilder from "ui-lib/query_builder";
import { isTokenValidForAccess } from "auth/lib/util";
import TypeList from "ui-observables/type_list";
import ResolveRefs from "ui-observables/resolve_refs";

class Item extends LightComponent {
    constructor(props) {
        super(props);

        this.teams = new TypeList({
            query: this.props.item && this.props.item.teams ? queryBuilder.anyOf("_id", this.props.item.teams) : false,
            type: "userrepo.team"
        });

        this.policies = new ResolveRefs({
            type: "userrepo.policy",
            refs: (this.props.item && this.props.item.policyRefs) || []
        });

        this.state = {
            teams: this.teams.value.getValue(),
            policies: this.policies.value.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.teams.start());
        this.addDisposable(this.policies.start());

        this.addDisposable(this.teams.value.subscribe((teams) => this.setState({ teams })));
        this.addDisposable(this.policies.value.subscribe((policies) => this.setState({ policies })));
    }

    componentWillReceiveProps(nextProps) {
        this.teams.setOpts({
            query: nextProps.item && nextProps.item.teams ? queryBuilder.anyOf("_id", nextProps.item.teams) : false
        });
        this.policies.setOpts({
            refs: (nextProps.item && nextProps.item.policyRefs) || []
        });
    }

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

        const teams = this.state.teams.toJS().map((item) => ({
            id: item._id,
            time: 0,
            item: item,
            Card: TeamCard,
            props: {}
        }));

        const policies = this.state.policies.toJS().map((item) => ({
            id: item._id,
            time: 0,
            item: item,
            Card: PolicyCard,
            props: {}
        }));

        return (
            <div>
                <TASection
                    controls={controls}
                    breadcrumbs={this.props.breadcrumbs}
                >
                    <div className={this.props.theme.container}>
                        <Row>
                            <Column xs={12} md={5}>
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
                                <Section>
                                    <Header label="Granted access policies" />
                                    <CardList list={Immutable.fromJS(policies)} />
                                </Section>
                            </Column>
                            <Column xs={12} md={7}>
                                <Section>
                                    <Header label="Teams" />
                                    <CardList list={Immutable.fromJS(teams)} />
                                </Section>
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
