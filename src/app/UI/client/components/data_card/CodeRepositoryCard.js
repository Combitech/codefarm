
import React from "react";
import LightComponent from "ui-lib/light_component";
import { UserAvatar } from "ui-components/user_avatar";
import { DateTime } from "ui-components/datetime";
import { Tags } from "ui-components/tags";
import DataCard from "./DataCard";
import { CardTitle } from "react-toolbox/lib/card";
import stateVar from "ui-lib/state_var";
import RepositoryUri from "ui-observables/repository_uri";
import { TypeChip } from "ui-components/data_chip";
import * as pathBuilder from "ui-lib/path_builder";

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
        const myItemPath = pathBuilder.fromType(this.props.item.type, this.props.item, { prefix: this.props.linkToAdmin ? "admin" : false });

        return (
            <DataCard
                theme={this.props.theme}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
                path={this.props.clickable ? myItemPath : ""}
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
                                    <TypeChip
                                        itemRef={{
                                            _ref: true,
                                            type: "artifactrepo.backend",
                                            id: this.props.item.backend
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>URI</td>
                                <td>
                                    {this.state.repositoryUri}
                                </td>
                            </tr>
                            <tr>
                                <td>Initial revision tags</td>
                                <td>
                                    <Tags list={this.props.item.initialRevisionTags} />
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
            </DataCard>
        );
    }
}

CodeRepositoryCard.defaultProps = {
    expanded: false,
    expandable: true,
    clickable: false
};

CodeRepositoryCard.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool,
    clickable: React.PropTypes.bool,
    linkToAdmin: React.PropTypes.bool
};

export default CodeRepositoryCard;
