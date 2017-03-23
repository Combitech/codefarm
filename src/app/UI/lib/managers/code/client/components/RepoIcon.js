
import React from "react";
import LightComponent from "ui-lib/light_component";
import { GitHubMarkerIcon, GerritDiffyIcon } from "ui-components/app_icons";
import CodeRepoAndBackend from "ui-observables/code_repo_and_backend";

class RepoIcon extends LightComponent {
    constructor(props) {
        super(props);

        this.repoAndBackend = new CodeRepoAndBackend({
            repoId: props.repoId
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
            repoId: nextProps.repoId
        });
    }

    render() {
        this.log("render", this.props, this.state);

        const backendType = this.state.repoBackend.get("backendType", false);

        let icon = (
            <div className={this.props.theme.repoIcon} />
        );
        if (backendType === "github") {
            icon = (
                <GitHubMarkerIcon className={this.props.theme.repoIcon} />
            );
        } else if (backendType === "gerrit") {
            icon = (
                <GerritDiffyIcon className={this.props.theme.repoIcon} />
            );
        }

        return icon;
    }
}

RepoIcon.propTypes = {
    theme: React.PropTypes.object,
    repoId: React.PropTypes.string.isRequired
};

export default RepoIcon;
