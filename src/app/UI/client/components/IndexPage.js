
import React from "react";
import moment from "moment";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import { Header, Row, Column, Loading } from "ui-components/layout";
import TypeList from "ui-observables/type_list";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import { CardList, RevisionCard, ArtifactCard } from "ui-components/data_card";

class IndexPage extends LightComponent {
    constructor(props) {
        super(props);

        this.revisions = new TypeList({
            type: "coderepo.revision",
            query: { status: { $ne: "abandoned" } },
            sortOn: "statusSetAt",
            limit: 10
        });

        this.artifacts = new TypeList({
            type: "artifactrepo.artifact",
            query: { state: "commited" },
            sortOn: "created",
            limit: 10
        });

        this.state = {
            revisions: this.revisions.value.getValue(),
            revisionsState: this.revisions.state.getValue(),
            artifacts: this.artifacts.value.getValue(),
            artifactsState: this.artifacts.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.revisions.start());

        this.addDisposable(this.revisions.value.subscribe((revisions) => this.setState({ revisions })));
        this.addDisposable(this.revisions.value.subscribe((revisionsState) => this.setState({ revisionsState })));

        this.addDisposable(this.artifacts.start());

        this.addDisposable(this.artifacts.value.subscribe((artifacts) => this.setState({ artifacts })));
        this.addDisposable(this.artifacts.value.subscribe((artifactsState) => this.setState({ artifactsState })));
    }

    render() {
        const revisions = this.state.revisions.map((revision) => Immutable.fromJS({
            id: revision.get("_id"),
            time: moment(revision.get("statusSetAt")).unix(),
            item: revision.toJS(),
            Card: RevisionCard,
            props: {}
        }));

        const artifacts = this.state.artifacts.map((artifact) => Immutable.fromJS({
            id: artifact.get("_id"),
            time: moment(artifact.get("created")).unix(),
            item: artifact.toJS(),
            Card: ArtifactCard,
            props: {}
        }));

        return (
            <div>
                <Row style={{ margin: "1.6rem", marginTop: "9.6rem" }}>
                    <Column xs={12} md={4}>
                        <Header label="Welcome" />
                        <p>
                            This is the code farm, where your code and artifacts are tested, integrated and delivered.
                        </p>
                    </Column>
                    <Column xs={12} md={4}>
                        <Header label="Latest revisions" />
                        <Loading show={this.state.revisionsState === ObservableDataStates.LOADING}/>
                        <CardList list={Immutable.fromJS(revisions)} />
                    </Column>
                    <Column xs={12} md={4}>
                        <Header label="Latest artifacts" />
                        <Loading show={this.state.artifactsState === ObservableDataStates.LOADING}/>
                        <CardList list={Immutable.fromJS(artifacts)} />
                    </Column>
                </Row>
            </div>
        );
    }
}

export default IndexPage;
