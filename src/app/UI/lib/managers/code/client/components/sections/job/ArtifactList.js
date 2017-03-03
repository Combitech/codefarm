
import React from "react";
import LightComponent from "ui-lib/light_component";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import {
    LoadIndicator as TALoadIndicator
} from "ui-components/type_admin";
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

        return (
            <table className={this.props.theme.artifactList}>
                <thead>
                    <tr>
                        <th>Repository</th>
                        <th>Name</th>
                        <th>State</th>
                        <th>Version</th>
                        <th>Size</th>
                        <th>MIME Type</th>
                        <th>Checksums</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.artifacts.toJS().map((artifact) => {
                        const hashList = Object.keys(artifact.fileMeta.hashes).map((key) => `${key}: ${artifact.fileMeta.hashes[key]}`);

                        return (
                            <tr key={artifact._id}>
                                <td>{artifact.repository}</td>
                                <td>{artifact.fileMeta.filename}</td>
                                <td>{artifact.state}</td>
                                <td>{artifact.version}</td>
                                <td>{artifact.fileMeta.size}</td>
                                <td>{artifact.fileMeta.mimeType}</td>
                                <td>{hashList.map((hash) => (
                                    <div key={hash}>{hash}</div>
                                ))}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }
}

ArtifactList.propTypes = {
    theme: React.PropTypes.object,
    artifactRefs: React.PropTypes.array.isRequired
};

export default ArtifactList;
