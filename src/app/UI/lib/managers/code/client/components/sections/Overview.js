
import React from "react";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import { Row, Col } from "react-flexbox-grid";
import moment from "moment";
import api from "api.io/api.io-client";
import stateVar from "ui-lib/state_var";
import BaselineList from "../../observables/baseline_list";
import { CardList, RevisionCard, AddCommentCard, CommentCard, ReviewCard, JobCard } from "ui-components/data_card";

class Overview extends LightComponent {
    constructor(props) {
        super(props);

        this.baselines = new BaselineList({
            type: props.item.type,
            id: props.item._id
        });

        this.state = {
            comment: stateVar(this, "comment", ""),
            baselines: this.baselines.value.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.baselines.start());

        this.addDisposable(this.baselines.value.subscribe((baselines) => this.setState({ baselines })));
    }

    componentWillReceiveProps(nextProps) {
        this.baselines.setOpts({
            id: nextProps.item._id,
            type: nextProps.item.type
        });
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

        this.props.item.reviews
            // Filter out reviews without author (email)
            // TODO: Remove filter once we are sure Email is resolved correctly
            .filter((review) => review.userEmail)
            .forEach((review, reviewIndex) => {
                list.push({
                    id: `review-${reviewIndex}`,
                    time: moment(review.updated).unix(),
                    item: review,
                    Card: ReviewCard,
                    props: {}
                });
            });

        // for (const baseline of this.state.baselines.toJS()) {
        //     const time = moment(baseline.created);
        //
        //     list.push({
        //         timestamp: time.unix(),
        //         id: `baseline-${baseline._id}`,
        //         avatar: (
        //             <img
        //                 className={this.props.theme.icon}
        //                 src={icons.baseline}
        //             />
        //         ),
        //         time: time,
        //         title: `Qualified for baseline ${baseline.name} `,
        //         description: `${baseline._id}`,
        //         details: {
        //             content: baseline.content
        //         }
        //     });
        // }

        const jobs = this.props.itemExt.data.refs
        .filter((ref) => ref.data && ref.data.type === "exec.job")
        .map((ref) => ref.data);

        for (const job of jobs) {
            list.push({
                id: job._id,
                time: moment(job.finished ? job.finished : (job.saved || job.started)).unix(),
                item: job,
                Card: JobCard,
                props: {
                }
            });
        }

        return (
            <div>
                <Row className={this.props.theme.row}>
                    <Col xs={12} md={6} className={this.props.theme.col}>
                        <h5 className={this.props.theme.sectionHeader}>Revision</h5>
                        <RevisionCard
                            theme={this.props.theme}
                            item={this.props.item}
                            expanded={true}
                            expandable={false}
                        />
                    </Col>
                    <Col xs={12} md={6} className={this.props.theme.col}>
                        <h5 className={this.props.theme.sectionHeader}>Events</h5>
                        <CardList list={Immutable.fromJS(list)} />
                    </Col>
                </Row>
            </div>
        );
    }
}

Overview.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    itemExt: React.PropTypes.object.isRequired
};

export default Overview;
