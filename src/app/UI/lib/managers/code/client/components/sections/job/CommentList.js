
import React from "react";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import moment from "moment";
import api from "api.io/api.io-client";
import stateVar from "ui-lib/state_var";
import { CardList, CommentCard, AddCommentCard } from "ui-components/data_card";

class CommentList extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            comment: stateVar(this, "comment", "")
        };
    }

    async onComment(comment) {
        await api.rest.action(this.props.item.type, this.props.item._id, "comment", comment);
    }

    render() {
        this.log("render", this.props, this.state);

        const list = [
            {
                id: "addcomment",
                time: Number.MAX_SAFE_INTEGER,
                Card: AddCommentCard,
                props: {
                    onComment: this.onComment.bind(this)
                }
            }
        ];

        for (const comment of this.props.item.comments) {
            list.push({
                id: comment.time,
                time: moment(comment.time).unix(),
                item: comment,
                Card: CommentCard,
                props: {}
            });
        }

        return (
            <CardList list={Immutable.fromJS(list)} expanded />
        );
    }
}

CommentList.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired
};

export default CommentList;
