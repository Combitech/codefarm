
import React from "react";
import LightComponent from "ui-lib/light_component";
import { CardTitle, CardText } from "react-toolbox/lib/card";
import UserAvatar from "ui-components/user_avatar";
import DateTime from "ui-components/datetime";
import ExpandableCard from "ui-components/expandable_card";
import stateVar from "ui-lib/state_var";
import UserItem from "ui-observables/user_item";

class CommentCard extends LightComponent {
    constructor(props) {
        super(props);

        this.user = new UserItem({
            identifier: (props.item.user && props.item.user.id) || false
        });

        this.state = {
            expanded: stateVar(this, "expanded", props.expanded),
            user: this.user.value.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.user.start());

        this.addDisposable(this.user.value.subscribe((user) => this.setState({ user })));
    }

    componentWillReceiveProps(nextProps) {
        this.user.setOpts({
            identifier: (nextProps.item.user && nextProps.item.user.id) || false
        });
    }

    render() {
        const user = this.state.user.toJS();

        let userCaption = "Someone";
        if (user.name) {
            const emailStr = user.email && user.email.length > 0 ? ` <${user.email[0]}>` : "";
            userCaption = `${user.name}${emailStr}`;
        }

        return (
            <ExpandableCard
                className={this.props.theme.card}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
            >
                <CardTitle
                    avatar={(
                        <UserAvatar
                            className={this.props.theme.avatar}
                            userId={user ? user._id : false}
                        />
                    )}
                    title={`${userCaption} said...`}
                    subtitle={(
                        <DateTime
                            value={this.props.item.time}
                            niceDate={true}
                        />
                    )}
                />
                <If condition={this.state.expanded.value}>
                    <CardText>
                        <pre className={this.props.theme.item}>
                            {this.props.item.text}
                        </pre>
                    </CardText>
                </If>
            </ExpandableCard>
        );
    }
}

CommentCard.defaultProps = {
    expanded: false,
    expandable: true
};

CommentCard.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool
};

export default CommentCard;
