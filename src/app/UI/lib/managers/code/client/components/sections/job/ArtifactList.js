
import React from "react";
import Immutable from "immutable";
import moment from "moment";
import LightComponent from "ui-lib/light_component";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import {
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";
import { CardList, ArtifactCard } from "ui-components/data_card";
import Artifacts from "../../../observables/artifact_list";

class ArtifactList extends LightComponent {
    constructor(props) {
        super(props);

        this.artifacts = new Artifacts({
            ids: props.artifactRefs.map((ref) => ref.id)
        });

        this.state = {
            artifacts: this.artifacts.value.getValue(),
            state: this.artifacts.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.artifacts.start());

        this.addDisposable(this.artifacts.value.subscribe((artifacts) => this.setState({ artifacts })));
        this.addDisposable(this.artifacts.state.subscribe((state) => this.setState({ state })));
    }

    componentWillReceiveProps(nextProps) {
        this.artifacts.setOpts({
            ids: nextProps.artifactRefs.map((ref) => ref.id)
        });
    }

    render() {
        if (this.state.state === ObservableDataStates.LOADING) {
            return (
                <TALoadIndicator />
            );
        }

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

        return (
            <CardList list={Immutable.fromJS(list)} />
        );
    }
}

ArtifactList.propTypes = {
    theme: React.PropTypes.object,
    artifactRefs: React.PropTypes.array.isRequired
};

export default ArtifactList;
