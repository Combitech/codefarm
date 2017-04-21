
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import CodeFarmIcon from "./ic_codefarm_black_48px.svg";
import ArtifactRepoAndBackend from "ui-observables/artifact_repo_and_backend";

class ArtifactRepoBackendIcon extends LightComponent {
    constructor(props) {
        super(props);

        this.repoAndBackend = new ArtifactRepoAndBackend({
            repoId: props.repoId || false
        });

        this.state = {
            repoBackend: this.repoAndBackend.backend.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.repoAndBackend.start());
        this.addDisposable(this.repoAndBackend.backend.subscribe((repoBackend) => this.setState({ repoBackend })));
    }

    componentWillReceiveProps(nextProps) {
        this.repoAndBackend.setOpts({
            repoId: nextProps.repoId || false
        });
    }

    render() {
        this.log("render", this.props, this.state);

        let backendType = this.props.backendType;
        if (!backendType) {
            backendType = this.state.repoBackend.get("backendType", false);
        }

        const classNames = [
            this.props.theme.appIcon,
            this.props.theme.repoBackendIcon
        ];

        let icon = (
            <div className={classNames.join(" ")} />
        );
        if (backendType === "fs") {
            icon = (
                <CodeFarmIcon className={classNames.join(" ")} />
            );
        }

        return icon;
    }
}

ArtifactRepoBackendIcon.propTypes = {
    theme: PropTypes.object,
    repoId: PropTypes.string,
    backendType: PropTypes.string
};

export default ArtifactRepoBackendIcon;
