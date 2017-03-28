
import React from "react";
import ImmutablePropTypes from "react-immutable-proptypes";
import LightComponent from "ui-lib/light_component";
import {
    Section as TASection,
    ControlButton as TAControlButton
} from "ui-components/type_admin";
import { Row, Column, Header, Section } from "ui-components/layout";
import { UserCard, TeamCard, PolicyCard } from "ui-components/data_card";
import CollaboratorAvatar from "ui-components/collaborator_avatar";
import * as queryBuilder from "ui-lib/query_builder";
import theme from "./theme.scss";
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
                disabled={!isSignedInUser}
                key="addkey"
                label="Add public key"
                onClick={() => this.context.router.push({
                    pathname: `${this.props.pathname}/addkey`
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

        controls.push((
            <TAControlButton
                disabled={!isSetTeamsGranted}
                key="setteams"
                label="Update teams"
                onClick={() => this.context.router.push({
                    pathname: `${this.props.pathname}/updateteams`
                })}
            />
        ));

        controls.push((
            <TAControlButton
                disabled={!isUploadAvatarGranted}
                key="uploadavatar"
                label="Upload avatar"
                onClick={() => this.context.router.push({
                    pathname: `${this.props.pathname}/uploadavatar`
                })}
            />
        ));

        const teamCards = [];
        this.state.teams.forEach((item) => {
            const team = item.toJS();
            teamCards.push((
                <TeamCard
                    key={team._id}
                    item={team}
                    expandable={true}
                    expanded={false}
                    theme={this.props.theme}
                />
            ));
        });

        const policyCards = [];
        this.state.policies.forEach((item) => {
            const policy = item.toJS();
            policyCards.push((
                <PolicyCard
                    key={policy._id}
                    item={policy}
                    expandable={true}
                    expanded={false}
                    theme={this.props.theme}
                />
            ));
        });

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
                                    />
                                </Section>
                                <Section>
                                    <Header label="Teams" />
                                    {teamCards}
                                </Section>
                                <Section>
                                    <Header label="Granted access policies" />
                                    {policyCards}
                                </Section>
                            </Column>
                            <Column xs={12} md={7}>
                                <Section>
                                    <Header label="Avatar" />
                                    <CollaboratorAvatar
                                        id={this.props.item._id}
                                        avatarType={"useravatar"}
                                        className={theme.avatarLarge}
                                    />
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
