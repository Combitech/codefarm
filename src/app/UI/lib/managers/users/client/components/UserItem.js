
import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import Immutable from "immutable";
import ImmutablePropTypes from "react-immutable-proptypes";
import LightComponent from "ui-lib/light_component";
import {
    Section as TASection,
    ListPager as TAListPager,
    MenuItem
} from "ui-components/type_admin";
import { Row, Column, Header, Section } from "ui-components/layout";
import { CardList, UserCard, ClaimCard, CommentCard, RevisionCard } from "ui-components/data_card";
import { isTokenValidForAccess } from "auth/lib/util";
import MetaDataList from "ui-observables/paged_metadata_list";
import RevisionList from "ui-observables/paged_revision_list";

class UserItem extends LightComponent {
    constructor(props) {
        super(props);

        this.claims = new MetaDataList({
            type: "metadata.claim",
            creatorRef: {
                _ref: true,
                type: this.props.item.type,
                id: this.props.item._id
            }
        });

        this.comments = new MetaDataList({
            type: "metadata.comment",
            creatorRef: {
                _ref: true,
                type: this.props.item.type,
                id: this.props.item._id
            }
        });

        this.revisions = new RevisionList({
            type: "coderepo.revision",
            query: {
                "patches.userRef.type": this.props.item.type,
                "patches.userRef.id": this.props.item._id
            },
            sortOn: "statusSetAt",
            limit: 5
        });

        this.state = {
            claims: this.claims.value.getValue(),
            comments: this.comments.value.getValue(),
            revisions: this.revisions.value.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.claims.start());
        this.addDisposable(this.comments.start());
        this.addDisposable(this.revisions.start());

        this.addDisposable(this.claims.value.subscribe((claims) => this.setState({ claims })));
        this.addDisposable(this.comments.value.subscribe((comments) => this.setState({ comments })));
        this.addDisposable(this.revisions.value.subscribe((revisions) => this.setState({ revisions })));
    }

    componentWillReceiveProps(nextProps) {
        this.claims.setOpts({
            creatorRef: {
                _ref: true,
                type: nextProps.item.type,
                id: nextProps.item._id
            }
        });

        this.comments.setOpts({
            creatorRef: {
                _ref: true,
                type: nextProps.item.type,
                id: nextProps.item._id
            }
        });

        this.revisions.setOpts({
            query: {
                "userRef.type": nextProps.item.type,
                "userRef.id": nextProps.item._id
            }
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

        const claims = this.state.claims.toJS().map((item) => ({
            id: item._id,
            time: moment(item.saved).unix(),
            item: item,
            Card: ClaimCard,
            props: {
                expanded: true,
                expandable: false
            }
        }));

        const comments = this.state.comments.toJS().map((item) => ({
            id: item._id,
            time: moment(item.saved).unix(),
            item: item,
            Card: CommentCard,
            props: {
                expanded: true,
                expandable: false
            }
        }));

        const revisions = this.state.revisions.toJS().map((item) => ({
            id: item._id,
            time: moment(item.statusSetAt).unix(),
            item: item,
            Card: RevisionCard,
            props: {
                clickable: true
            }
        }));

        const menuItems = this.props.menuItems.slice(0);

        if (isSignedInUser) {
            menuItems.push(
                <MenuItem
                    key="update_password"
                    caption="Update password"
                    pathname={`${this.props.pathname}/updatepassword`}
                />
            );

            menuItems.push(
                <MenuItem
                    key="add_public_key"
                    caption="Add public key"
                    pathname={`${this.props.pathname}/addkey`}
                />
            );
        }

        if (isSetPoliciesGranted) {
            menuItems.push(
                <MenuItem
                    key="update_policies"
                    caption="Update policies"
                    pathname={`${this.props.pathname}/updatepolicies`}
                />
            );
        }

        if (isSetTeamsGranted) {
            menuItems.push(
                <MenuItem
                    key="update_teams"
                    caption="Update teams"
                    pathname={`${this.props.pathname}/updateteams`}
                />
            );
        }

        if (isUploadAvatarGranted) {
            menuItems.push(
                <MenuItem
                    key="upload_avatar"
                    caption="Upload avatar"
                    pathname={`${this.props.pathname}/uploadavatar`}
                />
            );
        }

        return (
            <div>
                <TASection
                    controls={this.props.controls}
                    breadcrumbs={this.props.breadcrumbs}
                    menuItems={menuItems}
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

                                <Section>
                                    <Header label="Revisions" />
                                    <CardList
                                        list={Immutable.fromJS(revisions)}
                                        pager={
                                            <TAListPager
                                                pagedList={this.revisions}
                                                pagingInfo={this.revisions.pagingInfo.getValue()}
                                            />
                                        }
                                    />
                                </Section>
                            </Column>
                            <Column xs={12} md={6}>
                                <Section>
                                    <Header label="Claims" />
                                    <CardList
                                        list={Immutable.fromJS(claims)}
                                        pager={
                                            <TAListPager
                                                pagedList={this.claims}
                                                pagingInfo={this.claims.pagingInfo.getValue()}
                                            />
                                        }
                                    />
                                </Section>

                                <Section>
                                    <Header label="Comments" />
                                    <CardList
                                        list={Immutable.fromJS(comments)}
                                        pager={
                                            <TAListPager
                                                pagedList={this.comments}
                                                pagingInfo={this.comments.pagingInfo.getValue()}
                                            />
                                        }
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

UserItem.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    pathname: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    menuItems: PropTypes.array.isRequired,
    activeUser: ImmutablePropTypes.map.isRequired
};

export default UserItem;
