
import React from "react";
import LightComponent from "ui-lib/light_component";
import { Row, Col } from "react-flexbox-grid";
import Avatar from "react-toolbox/lib/avatar";
import Input from "react-toolbox/lib/input";
import { Button } from "react-toolbox/lib/button";
import moment from "moment";
import UserAvatar from "../UserAvatar";
import api from "api.io/api.io-client";
import stateVar from "ui-lib/state_var";
import BaselineList from "../../observables/baseline_list";
import { RevisionCard } from "ui-components/data_card";

const icons = {
    unknown: "/Cheser/48x48/status/dialog-question.png",
    queued: "/Cheser/48x48/actions/document-open-recent.png",
    ongoing: "/Cheser/48x48/status/appointment-soon.png",
    success: "/Cheser/48x48/emblems/emblem-default.png",
    aborted: "/Cheser/48x48/status/dialog-warning.png",
    fail: "/Cheser/48x48/emblems/emblem-dropbox-unsyncable.png",
    skip: "/Cheser/48x48/actions/system-log-out.png",
    neutral: "/Cheser/48x48/emotes/face-plain.png",
    happy: "/Cheser/48x48/emotes/face-laugh.png",
    unhappy: "/Cheser/48x48/emotes/face-crying.png",
    user: "/Cheser/48x48/status/avatar-default.png",
    job: "/Cheser/48x48/actions/system-run.png",
    baseline: "/Cheser/48x48/apps/accessories-text-editor.png"
};

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

    onComment() {
        console.log("comment", this.state.comment.value);

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

        const list = [];

        for (const comment of this.props.item.comments) {
            const time = moment(comment.time);

            list.push({
                timestamp: time.unix(),
                id: `comment-${comment.id}`,
                time: time,
                avatar: (
                    <img
                        className={this.props.theme.icon}
                        src={icons.user}
                    />
                ),
                title: "Someone wrote a comment",
                description: comment.text
            });
        }

        this.props.item.patches.forEach((patch, patchIndex, patches) => {
            const time = moment(patch.submitted);
            let title = `${patch.name} submitted a new patch`;

            if (patchIndex === (patches.length - 1) && this.props.item.status === "merged") {
                title = `${patch.name} merged revision`;
            }

            list.push({
                timestamp: time.unix(),
                id: `patch-${patchIndex}`,
                avatar: (
                    <Avatar className={this.props.theme.avatar}>
                        <UserAvatar
                            email={patch.email}
                            noAvatarIconName="person"
                        />
                    </Avatar>
                ),
                time: time,
                title: title,
                description: patch.comment,
                details: {
                    change: patch.change
                }
            });
        });

        for (const baseline of this.state.baselines.toJS()) {
            const time = moment(baseline.created);

            list.push({
                timestamp: time.unix(),
                id: `baseline-${baseline._id}`,
                avatar: (
                    <img
                        className={this.props.theme.icon}
                        src={icons.baseline}
                    />
                ),
                time: time,
                title: `Qualified for baseline ${baseline.name} `,
                description: `${baseline._id}`,
                details: {
                    content: baseline.content
                }
            });
        }

        const jobs = this.props.itemExt.data.refs
        .filter((ref) => ref.data && ref.data.type === "exec.job")
        .map((ref) => ref.data);

        for (const job of jobs) {
            const timeCreated = moment(job.created);

            list.push({
                timestamp: timeCreated.unix(),
                id: `jobcreated-${job._id}`,
                avatar: (
                    <img
                        className={this.props.theme.icon}
                        src={icons.job}
                    />
                ),
                time: timeCreated,
                title: `Included in job ${job.name}`,
                description: `${job._id}`
            });

            if (job.finished) {
                const timeFinished = moment(job.finished);
                const statusIcon = icons[job.status];
                let title = `Job ${job.name} `;

                if (job.status === "success") {
                    title += "successfull";
                } else if (job.status === "aborted") {
                    title += "was aborted";
                } else if (job.status === "skip") {
                    title += "was skipped";
                } else if (job.status === "fail") {
                    title += "failed";
                } else {
                    title += "finished with unknown status";
                }

                list.push({
                    timestamp: timeFinished.unix(),
                    id: `jobfinished-${job._id}`,
                    avatar: (
                        <img
                            className={this.props.theme.icon}
                            src={statusIcon}
                        />
                    ),
                    time: timeFinished,
                    title: title,
                    description: ` ${job._id}`
                });
            }
        }

        list.sort((a, b) => b.time - a.time);

        return (
            <div>
                <Row>
                    <Col xs={12} md={6}>
                        <h5 className={this.props.theme.sectionHeader}>Revision</h5>
                        <RevisionCard
                            theme={this.props.theme}
                            revision={this.props.item}
                            expanded={true}
                            expandable={false}
                        />
                    </Col>
                    <Col xs={12} md={6}>
                        <h5 className={this.props.theme.sectionHeader}>Events</h5>
                        <table className={this.props.theme.overviewTable}>
                            <tbody>
                                <tr>
                                    <td className={this.props.theme.avatarCell}>
                                        <img
                                            className={this.props.theme.icon}
                                            src={icons.user}
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
                                {list.map((item) => (
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
