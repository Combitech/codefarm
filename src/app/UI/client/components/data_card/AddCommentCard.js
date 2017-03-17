
import React from "react";
import LightComponent from "ui-lib/light_component";
import { CardTitle } from "react-toolbox/lib/card";
import { Button } from "react-toolbox/lib/button";
import UserAvatar from "ui-components/user_avatar";
import Input from "react-toolbox/lib/input";
import ExpandableCard from "ui-components/expandable_card";
import stateVar from "ui-lib/state_var";
import moment from "moment";

class AddCommentCard extends LightComponent {
    constructor(props) {
        super(props);

        // this.user = new UserItem({
        //     identifier: this.getLatestPatch(props).userId
        // });

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded),
            comment: stateVar(this, "comment", "")
            // user: this.user.value.getValue()
        };
    }

    // componentDidMount() {
    //     this.addDisposable(this.user.start());
    //
    //     this.addDisposable(this.user.value.subscribe((user) => this.setState({ user })));
    // }
    //
    // componentWillReceiveProps(nextProps) {
    //     this.user.setOpts({
    //         identifier: this.getLatestPatch(nextProps).userId
    //     });
    // }

    onComment() {
        console.log("onComment", this.state.comment.value);
        this.props.onComment({
            // user: {
            //     _ref: true,
            //     name: "Someone", // TODO
            //     type: "userrepo.user",
            //     id: false
            // },
            time: moment.utc().format(),
            text: this.state.comment.value
        })
        .then(() => this.state.comment.set(""))
        .catch((error) => {
            console.error("comment failed", error);
        });
    }

    render() {
        const user = null;// this.state.user.toJS()._id ? this.state.user.toJS() : null;

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
                            userId={user ? user._id : false}
                        />
                    )}
                    title="Say something..."
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
