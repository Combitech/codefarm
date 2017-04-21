
import React from "react";
import PropTypes from "prop-types";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import { Row, Column, Header, Section, Loading } from "ui-components/layout";
import { CardList, UserPolicyCard, UserCard } from "ui-components/data_card";
import UserListObservable from "ui-observables/paged_user_list";
import { ListPager } from "ui-components/type_admin";
import { States as ObservableDataStates } from "ui-lib/observable_data";

class UserPolicyView extends LightComponent {
    constructor(props) {
        super(props);

        this.users = new UserListObservable({
            limit: 10,
            query: {
                "policyRefs.id": props.item._id
            }
        });

        this.state = {
            users: this.users.value.getValue(),
            usersState: this.users.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.users.start());

        this.addDisposable(this.users.value.subscribe((users) => this.setState({ users })));
        this.addDisposable(this.users.value.subscribe((usersState) => this.setState({ usersState })));
    }

    componentWillReceiveProps(nextProps) {
        this.users.setOpts({
            query: {
                "policyRefs.id": nextProps.item._id
            }
        });
    }

    render() {
        this.log("render", this.props, this.state);

        const users = this.state.users.map((item) => Immutable.fromJS({
            id: item.get("_id"),
            time: 0,
            item: item.toJS(),
            Card: UserCard,
            props: {
                clickable: true
            }
        }));

        return (
            <Row>
                <Column xs={12} md={6}>
                    <Section>
                        <Header label="Properties" />
                        <UserPolicyCard
                            item={this.props.item}
                            expanded={true}
                            expandable={false}
                        />
                    </Section>
                </Column>
                <Column xs={12} md={6}>
                    <Header label="Users" />
                    <Loading show={this.state.usersState === ObservableDataStates.LOADING}/>
                    <CardList
                        list={Immutable.fromJS(users)}
                        pager={
                            <ListPager
                                pagedList={this.users}
                                pagingInfo={this.users.pagingInfo.getValue()}
                            />
                        }
                    />
                </Column>
            </Row>
        );
    }
}

UserPolicyView.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object
};

export default UserPolicyView;
