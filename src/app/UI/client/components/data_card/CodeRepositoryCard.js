
import React from "react";
import LightComponent from "ui-lib/light_component";
import { CardTitle } from "react-toolbox/lib/card";
import UserAvatar from "ui-components/user_avatar";
import DateTime from "ui-components/datetime";
import Tags from "ui-components/tags";
import ExpandableCard from "ui-components/expandable_card";
import stateVar from "ui-lib/state_var";
import RepositoryUri from "ui-observables/repository_uri";
import { CodeRepoBackendIcon } from "ui-components/app_icons";

class CodeRepositoryCard extends LightComponent {
    constructor(props) {
        super(props);

        this.repositoryUri = new RepositoryUri({
            id: props.item._id
        });

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded),
            repositoryUri: this.repositoryUri.value.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.repositoryUri.start());
        this.addDisposable(this.repositoryUri.value.subscribe((repositoryUri) => this.setState({ repositoryUri })));
    }

    componentWillReceiveProps(nextProps) {
        this.repositoryUri.setOpts({
            id: nextProps.item._id
        });
    }

    render() {
        return (
            <ExpandableCard
                className={this.props.theme.card}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
            >
                <CardTitle
                    avatar={(
                        <UserAvatar
                            className={this.props.theme.avatar}
                            defaultUrl="/Cheser/48x48/devices/drive-multidisk.png"
                        />
                    )}
                    title={this.props.item._id}
                    subtitle={(
                        <DateTime
                            value={this.props.item.created}
                            niceDate={true}
                        />
                    )}
                />
                <If condition={this.state.expanded.value}>
                    <table className={this.props.theme.table}>
                        <tbody>
                            <tr>
                                <td>Backend</td>
                                <td>
                                    <span className={this.props.theme.repoBackendIconContainer}>
                                        <CodeRepoBackendIcon
                                            repoId={this.props.item._id}
                                            theme={this.props.theme}
                                        />
                                    </span>
                                    {this.props.item.backend}
                                </td>
                            </tr>
                            <tr>
                                <td>URI</td>
                                <td>
                                    {this.state.repositoryUri}
                                </td>
                            </tr>
                            <tr>
                                <td>Tags</td>
                                <td>
                                    <Tags list={this.props.item.tags} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </If>
            </ExpandableCard>
        );
    }
}

CodeRepositoryCard.defaultProps = {
    expanded: false,
    expandable: true
};

CodeRepositoryCard.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool
};

export default CodeRepositoryCard;
