
import React from "react";
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

        const controls = this.props.controls.slice(0);

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
                    controls={controls}
                    breadcrumbs={this.props.breadcrumbs}
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
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

TeamItem.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default TeamItem;
