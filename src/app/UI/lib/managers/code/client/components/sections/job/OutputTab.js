
import React from "react";
import Immutable from "immutable";
import moment from "moment";
import LightComponent from "ui-lib/light_component";
import { CardList, ArtifactCard, RevisionCard } from "ui-components/data_card";
import Artifacts from "../../../observables/artifact_list";
import Revisions from "../../../observables/revision_list";

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
        const list = [];

        for (const artifact of this.state.artifacts.toJS()) {
            list.push({
                id: artifact._id,
                time: moment(artifact.created).unix(),
                item: artifact,
                Card: ArtifactCard,
                props: {}
            });
        }

        for (const revision of this.state.revisions.toJS()) {
            list.push({
                id: revision._id,
                time: 0,
                item: revision,
                Card: RevisionCard,
                props: {}
            });
        }

        return (
            <CardList list={Immutable.fromJS(list)} />
        );
    }
}

OutputTab.propTypes = {
    theme: React.PropTypes.object,
    artifactRefs: React.PropTypes.array.isRequired,
    revisionRefs: React.PropTypes.array.isRequired
};

export default OutputTab;
