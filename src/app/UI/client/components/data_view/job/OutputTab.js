
import React from "react";
import moment from "moment";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import { Row, Column, Header } from "ui-components/layout";
import { CardList, ArtifactCard, RevisionCard } from "ui-components/data_card";
import Artifacts from "ui-observables/artifact_list";
import Revisions from "ui-observables/revision_list";

class OutputTab extends LightComponent {
    constructor(props) {
        super(props);

        this.artifacts = new Artifacts({
            ids: props.artifactRefs.map((ref) => ref.id)
        });

        this.revisions = new Revisions({
            ids: props.revisionRefs.map((ref) => ref.id)
        });

        this.state = {
            artifacts: this.artifacts.value.getValue(),
            revisions: this.revisions.value.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.artifacts.start());
        this.addDisposable(this.revisions.start());

        this.addDisposable(this.artifacts.value.subscribe((artifacts) => this.setState({ artifacts })));
        this.addDisposable(this.revisions.value.subscribe((revisions) => this.setState({ revisions })));
    }

    componentWillReceiveProps(nextProps) {
        this.artifacts.setOpts({
            ids: nextProps.artifactRefs.map((ref) => ref.id)
        });

        this.revisions.setOpts({
            ids: nextProps.revisionRefs.map((ref) => ref.id)
        });
    }

    render() {
        const artifacts = this.state.artifacts.map((artifact) => Immutable.fromJS({
            id: artifact.get("_id"),
            time: moment(artifact.get("created")).unix(),
            item: artifact.toJS(),
            Card: ArtifactCard,
            props: {}
        }));

        const revisions = this.state.revisions.map((revision) => Immutable.fromJS({
            id: revision.get("_id"),
            time: 0,
            item: revision.toJS(),
            Card: RevisionCard,
            props: {}
        }));

        return (
            <Row>
                <Column xs={12} md={6}>
                    <Header label="Artifacts" />
                    <CardList list={artifacts} />
                </Column>
                <Column xs={12} md={6}>
                    <Header label="Revisions" />
                    <CardList list={revisions} />
                </Column>
            </Row>
        );
    }
}

OutputTab.propTypes = {
    theme: React.PropTypes.object,
    artifactRefs: React.PropTypes.array.isRequired,
    revisionRefs: React.PropTypes.array.isRequired
};

export default OutputTab;
