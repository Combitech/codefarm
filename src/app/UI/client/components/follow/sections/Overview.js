
import React from "react";
import Immutable from "immutable";
import moment from "moment";
import api from "api.io/api.io-client";
import LightComponent from "ui-lib/light_component";
import { Row, Column, Header } from "ui-components/layout";
import { CardList, RevisionCard, AddCommentCard, CommentCard, ReviewCard, JobCard, TypeCard } from "ui-components/data_card";

class Overview extends LightComponent {
    async onComment(comment) {
        comment.targetRef = {
            _ref: true,
            id: this.props.item._id,
            type: this.props.item.type
        };
        const createdComment = await api.rest.post("metadata.comment", comment);
        if (createdComment) {
            const commentRef = {
                _ref: true,
                id: createdComment._id,
                type: createdComment.type
            };
            await api.rest.action(this.props.item.type, this.props.item._id, "comment", commentRef);
        }
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

        const comments = this.props.itemExt.data.commentRefs.map((ref) => ref.data);
        for (const comment of comments) {
            list.push({
                id: comment.created,
                time: moment(comment.created).unix(),
                item: comment,
                Card: CommentCard,
                props: {
                    expanded: true
                }
            });
        }

        if (this.props.item.hasOwnProperty("patches")) {
            this.props.item.patches.forEach((patch, patchIndex) => {
                list.push({
                    id: `${this.props.item._id}-${patchIndex}`,
                    time: moment(patch.submitted).unix(),
                    item: this.props.item,
                    Card: RevisionCard,
                    props: {
                        patchIndex: patchIndex
                    }
                });
            });
        }

        if (this.props.item.hasOwnProperty("reviews")) {
            this.props.item.reviews.forEach((review, reviewIndex) => {
                list.push({
                    id: `review-${reviewIndex}`,
                    time: moment(review.updated).unix(),
                    item: review,
                    Card: ReviewCard,
                    props: {}
                });
            });
        }

        const jobs = this.props.itemExt.data.refs
        .filter((ref) => ref.data && ref.data.type === "exec.job")
        .map((ref) => ref.data);

        for (const job of jobs) {
            list.push({
                id: job._id,
                time: moment(job.finished ? job.finished : job.saved).unix(),
                item: job,
                Card: JobCard,
                props: {}
            });
        }

        return (
            <Row>
                <Column xs={12} md={6}>
                    <Header label={this.props.label} />
                    <TypeCard
                        item={this.props.item}
                        expanded={true}
                        expandable={false}
                    />
                </Column>
                <Column xs={12} md={6}>
                    <Header label="Events" />
                    <CardList list={Immutable.fromJS(list)} />
                </Column>
            </Row>
        );
    }
}

Overview.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    itemExt: React.PropTypes.object.isRequired,
    label: React.PropTypes.string.isRequired
};

export default Overview;
