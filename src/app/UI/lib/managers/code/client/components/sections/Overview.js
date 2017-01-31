
import React from "react";
import Component from "ui-lib/component";
import { Row, Col } from "react-flexbox-grid";
import Chip from "react-toolbox/lib/chip";
import Avatar from "react-toolbox/lib/avatar";
import PatchItem from "./overview_items/Patch";
import BaselineItem from "./overview_items/Baseline";
import JobItem from "./overview_items/Job";
import moment from "moment";
import UserAvatar from "../UserAvatar";
import FontIcon from "react-toolbox/lib/font_icon";

const ICON = {
    NO_AVATAR: "person",
    BASELINE_QUALIFIED: "info_outline",
    INCLUDED_IN_JOB: "info_outline",
    FINISHED_JOB: {
        success: "thumb_up",
        fail: "thumb_down"
    }
};

class Overview extends Component {
    constructor(props) {
        super(props);

        this.addTypeListStateVariable("baselines", "baselinegen.baseline", (props) => {
            return {
                "content.id": props.item._id
            };
        }, true);
    }

    render() {
        this.log("render", this.props, this.state);

        const list = [];

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
                    <UserAvatar
                        email={patch.email}
                        className={this.props.theme.avatar}
                        noAvatarIconName={ICON.NO_AVATAR}
                    />
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
                type: BaselineItem,
                id: `baseline-${baseline._id}`,
                avatar: <FontIcon value={ICON.BASELINE_QUALIFIED} />,
                time: time,
                title: `Qualified for the ${baseline.name} baseline `,
                description: `This baseline, with id ${baseline._id}, triggers steps ... bla bla bla ...`,
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
                type: JobItem,
                id: `jobcreated-${job._id}`,
                avatar: <FontIcon value={ICON.INCLUDED_IN_JOB} />,
                time: timeCreated,
                title: `Included in the ${job.name} job`,
                description: `This job with id ${job._id} does this and that`,
                details: {
                }
            });

            if (job.finished) {
                const timeFinished = moment(job.finished);

                const iconName = job.status === "success" ? ICON.FINISHED_JOB.success : ICON.FINISHED_JOB.fail;

                list.push({
                    timestamp: timeFinished.unix(),
                    type: JobItem,
                    id: `jobfinished-${job._id}`,
                    avatar: <FontIcon value={iconName} />,
                    time: timeFinished,
                    title: `Job ${job.name} finished with status: ${job.status}`,
                    description: `This job with id ${job._id} does this and that`,
                    details: {
                    }
                });
            }
        }

        list.sort((a, b) => b.time - a.time);

        return (
            <div>
                <Row>
                    <Col xs={12} md={5}>
                        <h3>About</h3>
                        <div className={this.props.theme.tags}>
                            {this.props.item.tags.map((tag) => (
                                <Chip key={tag}>{tag}</Chip>
                            ))}
                        </div>
                    </Col>
                    <Col xs={12} md={5}>
                        <h3>History</h3>
                        <table className={this.props.theme.overviewTable}>
                            <tbody>
                                {list.map((item) => (
                                    <tr
                                        key={item.id}
                                    >
                                        <td className={this.props.theme.avatarCell}>
                                            {typeof item.avatar === "string" ? (
                                                <Avatar
                                                    className={this.props.theme.avatar}
                                                    image={item.avatar}
                                                />
                                            ) : (
                                                <div className={this.props.theme.avatar}>
                                                    {item.avatar}
                                                </div>
                                            )}
                                            <div className={this.props.theme.time}>
                                                {item.time.format("HH:mm:ss")}
                                            </div>
                                            <div className={this.props.theme.time}>
                                                {item.time.format("ddd, MMMM DDDo")}
                                            </div>
                                            <div className={this.props.theme.time}>
                                                {item.time.format("YYYY")}
                                            </div>
                                        </td>
                                        <td className={this.props.theme.dataCell}>
                                            <div className={this.props.theme.overviewItem}>
                                                <div className={this.props.theme.title}>
                                                    {item.title}
                                                </div>
                                                <div className={this.props.theme.description}>
                                                    {item.description}
                                                </div>
                                                <item.type
                                                    theme={this.props.theme}
                                                    item={item}
                                                />
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
