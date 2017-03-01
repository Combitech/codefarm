
import React from "react";
import LightComponent from "ui-lib/light_component";
import moment from "moment";
import api from "api.io/api.io-client";
import Input from "react-toolbox/lib/input";
import { Button } from "react-toolbox/lib/button";
import stateVar from "ui-lib/state_var";

class ItemComments extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            comment: stateVar(this, "comment", "")
        };
    }

    onComment() {
        api.type.action(this.props.item.type, this.props.item._id, "comment", {
            // user: {
            //     _ref: true,
            //     name: "Someone", // TODO
            //     type: "userrepo.user",
            //     id: false
            // },
            time: moment.utc().format(),
            text: this.state.comment.value
        })
        .then(() => this.state.comment.set())
        .catch((error) => {
            console.error("comment failed", error);
        });
    }

    render() {
        this.log("render", this.props, this.state);

        const comments = [];

        for (const comment of this.props.item.comments) {
            const time = moment(comment.time);

            comments.push({
                timestamp: time.unix(),
                id: `comment-${comment.id}`,
                time: time,
                avatar: (
                    <img
                        className={this.props.theme.icon}
                        src="/Cheser/48x48/status/avatar-default.png"
                    />
                ),
                title: "Someone wrote a comment",
                description: comment.text
            });
        }

        comments.sort((a, b) => b.time - a.time);

        return (
            <table className={this.props.theme.overviewTable}>
                <tbody>
                    <tr>
                        <td className={this.props.theme.avatarCell}>
                            <img
                                className={this.props.theme.icon}
                                src="/Cheser/48x48/status/avatar-default.png"
                            />
                        </td>
                        <td className={this.props.theme.dataCell}>
                            <h5 className={this.props.theme.commentTitle}>
                                <Button
                                    className={this.props.theme.commentButton}
                                    label="Post comment"
                                    primary={true}
                                    onClick={() => this.onComment()}
                                />
                                <div className={this.props.theme.commentTitleText}>Leave a comment</div>
                                <div style={{ clear: "both" }}></div>
                            </h5>
                            <div className={this.props.theme.commentContainer}>
                                <Input
                                    className={this.props.theme.commentInput}
                                    type="text"
                                    placeholder="Write comment here..."
                                    name="comment"
                                    multiline={true}
                                    value={this.state.comment.value}
                                    onChange={this.state.comment.set}
                                />
                            </div>
                        </td>
                    </tr>
                    {comments.map((item) => (
                        <tr
                            key={item.id}
                        >
                            <td className={this.props.theme.avatarCell}>
                                {item.avatar}
                            </td>
                            <td className={this.props.theme.dataCell}>
                                <h5 className={this.props.theme.title}>
                                    {item.title}
                                    <span className={this.props.theme.time}>
                                        {item.time.format("HH:mm:ss - dddd, MMMM DDDo YYYY")}
                                    </span>
                                </h5>
                                <div className={this.props.theme.description}>
                                    {item.description}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
}

ItemComments.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired
};

export default ItemComments;
