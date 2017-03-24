
import React from "react";
import LightComponent from "ui-lib/light_component";
import { CardTitle } from "react-toolbox/lib/card";
import { Button } from "react-toolbox/lib/button";
import UserAvatar from "ui-components/user_avatar";
import Input from "react-toolbox/lib/input";
import ExpandableCard from "ui-components/expandable_card";
import stateVar from "ui-lib/state_var";
import ActiveUser from "ui-observables/active_user";
import Notification from "ui-observables/notification";

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
        const signedInUser = this.state.activeUser.toJS();
        this.props.onComment({
            sourceRef: {
                _ref: true,
                name: signedInUser.username,
                type: "userrepo.user",
                id: signedInUser.id
            },
            text: this.state.comment.value
        })
        .then(() => {
            this.state.comment.set("");
            Notification.instance.publish("Comment added successfully!");
        })
        .catch((error) => {
            Notification.instance.publish(`Failed to publish comment: ${error.message || error}`, "warning");
            console.error("comment failed", error);
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
    theme: React.PropTypes.object,
    onComment: React.PropTypes.func.isRequired
};

export default AddCommentCard;
