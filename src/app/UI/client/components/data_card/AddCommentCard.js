
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { CardTitle } from "react-toolbox/lib/card";
import { Button } from "react-toolbox/lib/button";
import { UserAvatar } from "ui-components/user_avatar";
import Input from "react-toolbox/lib/input";
import { ExpandableCard } from "ui-components/expandable_card";
import stateVar from "ui-lib/state_var";
import ActiveUser from "ui-observables/active_user";

class AddCommentCard extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded),
            comment: stateVar(this, "comment", ""),
            activeUser: ActiveUser.instance.user.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(ActiveUser.instance.user.subscribe((activeUser) => this.setState({ activeUser })));
    }

    onComment() {
        this.props.onComment({
            text: this.state.comment.value
        })
        .then(() => {
            this.state.comment.set("");
        });
    }

    render() {
        const signedInUser = this.state.activeUser.toJS();

        const userCaption = signedInUser.username ? signedInUser.username : "Someone";

        return (
            <ExpandableCard
                className={this.props.theme.card}
                expanded={this.state.expanded}
                expandable={false}
            >
                <Button
                    className={this.props.theme.postButton}
                    label="Post"
                    primary={true}
                    disabled={this.state.comment.value === ""}
                    onClick={() => this.onComment()}
                />
                <CardTitle
                    avatar={(
                        <UserAvatar
                            className={this.props.theme.avatar}
                            userId={signedInUser ? signedInUser.id : false}
                        />
                    )}
                    title={`${userCaption}, say something...`}
                />
                <Input
                    className={this.props.theme.input}
                    type="text"
                    placeholder="Write comment here..."
                    name="comment"
                    multiline={true}
                    value={this.state.comment.value}
                    onChange={this.state.comment.set}
                />
            </ExpandableCard>
        );
    }
}

AddCommentCard.propTypes = {
    theme: PropTypes.object,
    onComment: PropTypes.func.isRequired
};

export default AddCommentCard;
