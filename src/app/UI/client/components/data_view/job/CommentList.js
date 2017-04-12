
import React from "react";
import Immutable from "immutable";
import moment from "moment";
import stateVar from "ui-lib/state_var";
import LightComponent from "ui-lib/light_component";
import { CardList, CommentCard, AddCommentCard } from "ui-components/data_card";
import MetaDataList from "ui-observables/paged_metadata_list";
import { createComment } from "ui-lib/comment";

class CommentList extends LightComponent {
    constructor(props) {
        super(props);

        this.comments = new MetaDataList({
            type: "metadata.comment",
            targetRef: {
                _ref: true,
                type: this.props.item.type,
                id: this.props.item._id
            }
        });

        this.state = {
            comment: stateVar(this, "comment", ""),
            comments: this.comments.value.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.comments.start());
        this.addDisposable(this.comments.value.subscribe((comments) => this.setState({ comments })));
    }

    componentWillReceiveProps(nextProps) {
        this.comments.setOpts({
            creatorRef: {
                _ref: true,
                type: nextProps.item.type,
                id: nextProps.item._id
            }
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
