
import React from "react";
import LightComponent from "ui-lib/light_component";
import { CardTitle, CardText } from "react-toolbox/lib/card";
import UserAvatar from "ui-components/user_avatar";
import DateTime from "ui-components/datetime";
import ExpandableCard from "ui-components/expandable_card";
import stateVar from "ui-lib/state_var";
import UserName from "ui-components/user_name";

class CommentCard extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: stateVar(this, "expanded", props.expanded)
        };
    }

    render() {
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
                            userId={this.props.item.user ? this.props.item.user.id : false}
                        />
                    )}
                    title={(
                        <UserName
                            userId={this.props.item.user ? this.props.item.user.id : false}
                            notFoundText="Someone"
                            suffixText="said..."
                        />
                    )}
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
