
import React from "react";
import LightComponent from "ui-lib/light_component";
import {
    Section as TASection
} from "ui-components/type_admin";
import { Row, Column, Header, Section } from "ui-components/layout";
import { TeamCard, UserCard } from "ui-components/data_card";
import CollaboratorAvatar from "ui-components/collaborator_avatar";
import theme from "./theme.scss";
import TypeList from "ui-observables/type_list";

class Item extends LightComponent {
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

        const userCards = [];
        this.state.users.forEach((item) => {
            const user = item.toJS();
            userCards.push((
                <UserCard
                    key={user._id}
                    item={user}
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
                                    <TeamCard
                                        theme={this.props.theme}
                                        item={this.props.item}
                                        expandable={false}
                                        expanded={true}
                                    />
                                </Section>
                                <Section>
                                    <Header label="Users" />
                                    {userCards}
                                </Section>
                            </Column>
                            <Column xs={12} md={7}>
                                <Section>
                                    <Header label="Avatar" />
                                    <CollaboratorAvatar
                                        id={this.props.item._id}
                                        avatarType={"teamavatar"}
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
    controls: React.PropTypes.array.isRequired
};

Item.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default Item;
