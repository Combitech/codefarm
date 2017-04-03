
import React from "react";
import Immutable from "immutable";
import moment from "moment";
import stateVar from "ui-lib/state_var";
import LightComponent from "ui-lib/light_component";
import { CardList, CommentCard, AddCommentCard } from "ui-components/data_card";
import CommentListObservable from "ui-observables/comment_list";
import { createComment } from "ui-lib/comment";

class CommentList extends LightComponent {
    constructor(props) {
        super(props);

        this.commentList = new CommentListObservable({
            commentRefs: (props.item && props.item.commentRefs) || []
        });

        this.state = {
            comment: stateVar(this, "comment", ""),
            comments: this.commentList.value.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.commentList.start());
        this.addDisposable(this.commentList.value.subscribe((comments) => this.setState({ comments })));
    }

    componentWillReceiveProps(nextProps) {
        this.commentList.setOpts({
            commentRefs: (nextProps.item && nextProps.item.commentRefs) || []
        });
    }

    async onComment(comment) {
        await createComment(comment, this.props.item);
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

        this.state.comments.forEach((item) => {
            const comment = item.toJS();
            list.push({
                id: comment.created,
                time: moment(comment.created).unix(),
                item: comment,
                Card: CommentCard,
                props: {}
            });
        });

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
