
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { HiddenText } from "ui-components/hidden_text";
import { DateTime } from "ui-components/datetime";
import { Tags } from "ui-components/tags";
import DataCard from "./DataCard";
import { CardTitle } from "react-toolbox/lib/card";
import { TypeChip } from "ui-components/data_chip";
import stateVar from "ui-lib/state_var";
import * as pathBuilder from "ui-lib/path_builder";

class ArtifactCard extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded)
        };
    }

    render() {
        const icon = () => {
            if (this.props.item.state === "commited") {
                return "/Cheser/48x48/mimetypes/package-x-generic.png";
            }

            return "/Cheser/48x48/mimetypes/application-x-rpm.png";
        };

        const myItemPath = pathBuilder.fromType("artifactrepo.artifact", this.props.item);

        return (
            <DataCard
                theme={this.props.theme}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
                path={myItemPath}
            >
                <CardTitle
                    avatar={(
                        <img
                            className={this.props.theme.avatar}
                            src={icon()}
                        />
                    )}
                    title={(
                        <span>
                            {`${this.props.item.name} - ${this.props.item.version}`}
                        </span>
                    )}
                    subtitle={(
                        <DateTime
                            value={this.props.item.created}
                            niceDate={true}
                        />
                    )}
                />
                <If condition={this.state.expanded.value}>
                    <table className={`${this.props.theme.table} ${this.props.theme.tableFixed}`}>
                        <tbody>
                            <tr>
                                <td>State</td>
                                <td>{this.props.item.state}</td>
                            </tr>
                            <tr>
                                <td>Filename</td>
                                <td>
                                    <span className={this.props.theme.monospace}>
                                        {this.props.item.fileMeta.filename}
                                    </span>
                                    <HiddenText
                                        className={this.props.theme.hiddenText}
                                        label="SHOW ID"
                                        text={this.props.item._id}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Repository</td>
                                <td>
                                    <TypeChip
                                        itemRef={{
                                            _ref: true,
                                            type: "artifactrepo.repository",
                                            id: this.props.item.repository
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Size</td>
                                <td>{this.props.item.fileMeta.size}</td>
                            </tr>
                            <tr>
                                <td>Mimetype</td>
                                <td>{this.props.item.fileMeta.mimeType}</td>
                            </tr>
                            <If condition={this.props.item.fileMeta.hasOwnProperty("hashes")}>
                                <For each="key" of={Object.keys(this.props.item.fileMeta.hashes)}>
                                    <tr key={key}>
                                        <td>{key}</td>
                                        <td className={this.props.theme.monospace}>
                                            {this.props.item.fileMeta.hashes[key]}
                                        </td>
                                    </tr>
                                </For>
                            </If>
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

ArtifactCard.defaultProps = {
    expanded: false,
    expandable: true,
    clickable: false
};

ArtifactCard.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    expanded: PropTypes.bool,
    expandable: PropTypes.bool,
    clickable: PropTypes.bool
};

ArtifactCard.contextTypes = {
    router: PropTypes.object.isRequired
};

export default ArtifactCard;
