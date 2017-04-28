
import React from "react";
import PropTypes from "prop-types";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import {
    Section as TASection
} from "ui-components/type_admin";
import { Row, Column, Header, Section } from "ui-components/layout";
import { CardList, TeamCard, UserCard } from "ui-components/data_card";
import TypeList from "ui-observables/type_list";

class TeamItem extends LightComponent {
    constructor(props) {
        super(props);

        this.users = new TypeList({
            query: this.props.item ? { teams: this.props.item._id } : false,
            type: "userrepo.user"
        });

        this.state = {
            users: this.users.value.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.users.start());
        this.addDisposable(this.users.value.subscribe((users) => this.setState({ users })));
    }

    componentWillReceiveProps(nextProps) {
        this.users.setOpts({
            query: nextProps.item ? { teams: nextProps.item._id } : false
        });
    }

    render() {
        this.log("render", this.props);

        const users = this.state.users.toJS().map((item) => ({
            id: item._id,
            time: 0,
            item: item,
            Card: UserCard,
            props: {
                clickable: true
            }
        }));

        return (
            <div>
                <TASection
                    controls={this.props.controls}
                    breadcrumbs={this.props.breadcrumbs}
                    menuItems={this.props.menuItems}
                >
                    <div className={this.props.theme.container}>
                        <Row>
                            <Column xs={12} md={5}>
                                <Section>
                                    <Header label="Properties" />
                                    <TeamCard
                                        theme={this.props.theme}
                                        item={this.props.item}
                                        expandable={false}
                                        expanded={true}
                                        largeIcon={true}
                                    />
                                </Section>
                            </Column>
                            <Column xs={12} md={7}>
                                <Section>
                                    <Header label="Users" />
                                    <CardList list={Immutable.fromJS(users)} />
                                </Section>
                            </Column>
                        </Row>
                    </div>
                </TASection>
            </div>
        );
    }
}

TeamItem.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    pathname: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    menuItems: PropTypes.array.isRequired
};

export default TeamItem;
