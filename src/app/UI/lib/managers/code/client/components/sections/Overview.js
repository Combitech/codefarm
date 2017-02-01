
import React from "react";
import Component from "ui-lib/component";
import { Row, Col } from "react-flexbox-grid";
import Chip from "react-toolbox/lib/chip";
import Avatar from "react-toolbox/lib/avatar";
import Input from "react-toolbox/lib/input";
import { Button } from "react-toolbox/lib/button";
import PatchItem from "./overview_items/Patch";
import moment from "moment";
import UserAvatar from "../UserAvatar";
import api from "api.io/api.io-client";

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

class Overview extends Component {
    constructor(props) {
        super(props);

        this.addTypeListStateVariable("baselines", "baselinegen.baseline", (props) => {
            return {
                "content.id": props.item._id
            };
        }, true);

        this.addStateVariable("comment", "");
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
        .then((response) => {
            if (response.result !== "success") {
                console.error("comment failed", response);
            } else {
                return this.state.comment.set();
            }
        })
        .catch((error) => {
            console.error("comment failed", error);
        });
    }

    render() {
        this.log("render", this.props, this.state);

        const list = [];
        const latestPatch = this.props.item.patches[this.props.item.patches.length - 1];

        for (const comment of this.props.item.comments) {
            const time = moment(comment.time);

            list.push({
                timestamp: time.unix(),
                type: PatchItem,
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

        for (const patch of this.props.item.patches) {
            const time = moment(patch.submitted);
            let title = `${patch.name} submitted a new patch`;

            if (patch.index === this.props.item.patches.length && this.props.item.status === "merged") {
                title = `${patch.name} merged revision`;
            }

            list.push({
                timestamp: time.unix(),
                type: PatchItem,
                id: `patch-${patch.index}`,
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
        }

        for (const baseline of this.state.baselines) {
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
                    title += " failed";
                } else {
                    title += " finished with unknown status";
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
                    <Col xs={12} md={7}>
                        <h4>Revision</h4>
                        <table className={this.props.theme.information}>
                            <tbody>
                                <tr>
                                    <td>Author</td>
                                    <td>
                                        <Avatar className={this.props.theme.avatar}>
                                            <UserAvatar
                                                email={latestPatch.email}
                                                noAvatarIconName="person"
                                            />
                                        </Avatar>
                                        <span className={this.props.theme.name}>
                                            {latestPatch.name}
                                        </span>
                                        <span className={this.props.theme.email}>
                                            {`<${latestPatch.email}>`}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Status</td>
                                    <td>
                                        {this.props.item.status}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Repository</td>
                                    <td>
                                        {this.props.item.repository}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Patches</td>
                                    <td>
                                        {this.props.item.patches.length}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Refname</td>
                                    <td className={this.props.theme.monospace}>
                                        {latestPatch.change.refname}
                                    </td>
                                </tr>
                                <tr>
                                    <td>SHA1</td>
                                    <td className={this.props.theme.monospace}>
                                        {latestPatch.change.newrev}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Previous SHA1</td>
                                    <td className={this.props.theme.monospace}>
                                        {latestPatch.change.oldrev}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Tags</td>
                                    <td>
                                        {this.props.item.tags.map((tag) => (
                                            <Chip key={tag}>{tag}</Chip>
                                        ))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Col>
                    <Col xs={12} md={5}>
                        <h4>Events</h4>
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
                                        <div className={this.props.theme.description}>
                                            <Input
                                                className={this.props.theme.commentInput}
                                                type="text"
                                                placeholder="Please leave a comment..."
                                                name="comment"
                                                multiline={true}
                                                value={this.state.comment.value}
                                                onChange={this.state.comment.set}
                                            />
                                            <Button
                                                className={this.props.theme.commentButton}
                                                label="Comment"
                                                primary={true}
                                                onClick={() => this.onComment()}
                                            />
                                            <div style={{ clear: "both" }}></div>
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
