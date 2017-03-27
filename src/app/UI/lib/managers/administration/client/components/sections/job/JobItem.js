
/* global window */

import React from "react";
import Immutable from "immutable";
import moment from "moment";
import LightComponent from "ui-lib/light_component";
import Link from "react-toolbox/lib/link";
import { Tab, Tabs } from "react-toolbox/lib/tabs";
import { Row, Column as Col, Header, Section } from "ui-components/layout";
import LogListItem from "./LogListItem";
import ArtifactListItem from "./JobListItem";
import SubJobListItem from "./SubJobListItem";
import api from "api.io/api.io-client";
import {
    Section as TASection,
    List as TAList,
    ControlButton as TAControlButton
} from "ui-components/type_admin";
import { CardList, CommentCard, AddCommentCard, JobCard } from "ui-components/data_card";
import CommentListObservable from "ui-observables/comment_list";
import * as pathBuilder from "ui-lib/path_builder";
import * as queryBuilder from "ui-lib/query_builder";
import { createComment } from "ui-lib/comment";
import Notification from "ui-observables/notification";

class Item extends LightComponent {
    constructor(props) {
        super(props);

        this.commentList = new CommentListObservable({
            commentRefs: (props.item && props.item.commentRefs) || []
        });

        this.state = {
            runId: false,
            runTabIndex: 0,
            baselineCollectorIndex: 0,
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

    async _downloadLog(item) {
        const url = `/logrepo/log/${item._id}/download`;
        console.log(`Download from ${url}`);

        // Ugly way of downloading file from javascript...
        window.location = url;
    }

    async onRerun() {
        await api.rest.action(
            "exec.job",
            this.props.item._id,
            "rerun"
        );

        Notification.instance.publish("Job re-run requested");
    }

    async onComment(comment) {
        await createComment(comment, this.props.item);
    }

    render() {
        this.log("render", this.props, this.state);
        const item = this.props.item;

        const controls = this.props.controls.slice(0);

        if (item.finished) {
            controls.push((
                <TAControlButton
                    key="rerun"
                    label="Rerun"
                    onClick={() => this.onRerun()}
                />
            ));
        }

        const arrayGetIds = (arr) => arr.map((item) => item.id);

        let baselineContent;

        if (item.baseline.content) {
            baselineContent = (
                <Section>
                    <Header label="Baseline" />
                    <table className={this.props.theme.properties}>
                        <tbody>
                            <tr>
                                <td>Id</td>
                                <td>{item.baseline._id}</td>
                            </tr>
                            <tr>
                                <td>Name</td>
                                <td>{item.baseline.name}</td>
                            </tr>
                        </tbody>
                    </table>

                    <Tabs
                        index={this.state.baselineCollectorIndex}
                        onChange={(baselineCollectorIndex) => this.setState({ baselineCollectorIndex })}
                    >
                    {item.baseline.content.map((collector, index) => (
                        <Tab key={index} label={`${collector.name} (${collector.id.length})`}>
                            <TAList
                                type={collector.type}
                                query={queryBuilder.anyOf("_id", collector.id)}
                                onSelect={(item) => {
                                    this.context.router.push({
                                        pathname: pathBuilder.fromType(collector.type, item)
                                    });
                                }}
                            />
                        </Tab>
                    ))}
                    </Tabs>
                </Section>
            );
        }

        const lastRunId = item.lastRunId === false ? 0 : item.lastRunId;
        const runContent = (
            <Section>
                <Header label="Runs" />
                <Tabs
                    index={this.state.runId === false ? lastRunId : this.state.runId}
                    onChange={(runId) => this.setState({ runId })}
                >
                    {item.runs.map((run, index) => (
                        <Tab key={index} label={`Run ${index}`}>
                            <div className={this.props.theme.panel}>
                                <h6 className={this.props.theme.title}>Properties</h6>
                                <Row>
                                    <Col xs={12} md={5} className={this.props.theme.panel}>
                                        <table className={this.props.theme.properties}>
                                            <tbody>
                                                <tr>
                                                    <td>Slave Id</td>
                                                    <td>
                                                        <Link
                                                            label={run.slaveId || "None"}
                                                            onClick={() => {
                                                                this.context.router.push({
                                                                    pathname: pathBuilder.fromType("exec.slave", { _id: run.slaveId })
                                                                });
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Finished</td>
                                                    <td>{run.finished ? `at ${run.finished}` : "No"}</td>
                                                </tr>
                                                <tr>
                                                    <td>Status</td>
                                                    <td>{run.status}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </Col>
                                </Row>
                            </div>
                            <Tabs
                                index={this.state.runTabIndex}
                                onChange={(runTabIndex) => this.setState({ runTabIndex })}
                            >
                                <Tab key={0} label={`Logs (${run.logs.length})`}>
                                    <TAList
                                        type="logrepo.log"
                                        query={queryBuilder.anyOf("_id", run.logs.map((l) => l.id))}
                                        onSelect={this._downloadLog.bind(this)}
                                        ListItemComponent={LogListItem}
                                        listItemContext={run.logs}
                                    />
                                </Tab>
                                <Tab key={1} label={`Artifacts (${run.artifacts.length})`}>
                                    <TAList
                                        type="artifactrepo.artifact"
                                        query={queryBuilder.anyOf("_id", arrayGetIds(run.artifacts))}
                                        onSelect={(item) => {
                                            this.context.router.push({
                                                pathname: pathBuilder.fromType("artifactrepo.artifact", item)
                                            });
                                        }}
                                        ListItemComponent={ArtifactListItem}
                                    />
                                </Tab>
                                <Tab key={2} label={`Revisions (${run.revisions.length})`}>
                                    <TAList
                                        type="coderepo.revision"
                                        query={queryBuilder.anyOf("_id", arrayGetIds(run.revisions))}
                                        onSelect={(item) => {
                                            this.context.router.push({
                                                pathname: pathBuilder.fromType("coderepo.revision", item)
                                            });
                                        }}
                                    />
                                </Tab>
                                <Tab key={3} label={`Sub Jobs (${run.subJobs.length})`}>
                                    <TAList
                                        type="exec.subjob"
                                        query={queryBuilder.anyOf("_id", arrayGetIds(run.subJobs))}
                                        ListItemComponent={SubJobListItem}
                                        listItemContext={{ pathname: this.props.pathname }}
                                    />
                                </Tab>
                            </Tabs>
                        </Tab>
                    ))}
                </Tabs>
            </Section>
        );

        const commentCardList = [
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
            commentCardList.push({
                id: comment.created,
                time: moment(comment.created).unix(),
                item: comment,
                Card: CommentCard,
                props: {}
            });
        });

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <div className={this.props.theme.container}>
                    <Row>
                        <Col xs={12} md={5}>
                            <Section>
                                <Header label="Properties" />
                                <JobCard
                                    item={item}
                                    expanded={true}
                                    expandable={false}
                                    showAdvanced={true}
                                    linkSlave={true}
                                />
                            </Section>
                        </Col>
                        <Col xs={12} md={7}>
                            {baselineContent}
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            {runContent}
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={5}>
                            <CardList list={Immutable.fromJS(commentCardList)} expanded />
                        </Col>
                    </Row>
                </div>
            </TASection>
        );
    }
}

Item.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

Item.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default Item;
