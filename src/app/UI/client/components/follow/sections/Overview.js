
import React from "react";
import PropTypes from "prop-types";
import Immutable from "immutable";
import moment from "moment";
import LightComponent from "ui-lib/light_component";
import { Row, Column, Header } from "ui-components/layout";
import { CardList, RevisionCard, AddCommentCard, CommentCard, ReviewCard, JobCard, TypeCard } from "ui-components/data_card";
import { createComment } from "ui-lib/comment";
import MetaDataList from "ui-observables/paged_metadata_list";
import TypeList from "ui-observables/type_list";

class Overview extends LightComponent {
    constructor(props) {
        super(props);

        this.comments = new MetaDataList({
            type: "metadata.comment",
            targetRef: {
                _ref: true,
                type: props.item.type,
                id: props.item._id
            }
        });

        this.jobList = new TypeList({
            type: "exec.job",
            query: this.getQuery(props)
        });

        this.state = {
            jobs: this.jobList.value.getValue(),
            comments: this.comments.value.getValue()
        };
    }

    getQuery(props) {
        const ids = props.item.refs
        .filter((ref) => ref.type === "exec.job")
        .map((ref) => ref.id);

        return ids.length > 0 ? { _id: { $in: ids } } : false;
    }

    componentDidMount() {
        this.addDisposable(this.comments.start());
        this.addDisposable(this.comments.value.subscribe((comments) => this.setState({ comments })));

        this.addDisposable(this.jobList.start());
        this.addDisposable(this.jobList.value.subscribe((jobs) => this.setState({ jobs })));
    }

    componentWillReceiveProps(nextProps) {
        this.comments.setOpts({
            targetRef: {
                _ref: true,
                type: nextProps.item.type,
                id: nextProps.item._id
            }
        });

        this.jobList.setOpts({
            type: "exec.job",
            query: this.getQuery(nextProps)
        });
    }

    async onComment(comment) {
        return createComment(comment, this.props.item);
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
                props: {
                    expanded: true
                }
            });
        });

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

        this.state.jobs.forEach((item) => {
            const job = item.toJS();
            list.push({
                id: job._id,
                time: moment(job.finished ? job.finished : job.saved).unix(),
                item: job,
                Card: JobCard,
                props: {}
            });
        });

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
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired
};

export default Overview;
