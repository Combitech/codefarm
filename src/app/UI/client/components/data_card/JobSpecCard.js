
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { HiddenText } from "ui-components/hidden_text";
import { DateTime } from "ui-components/datetime";
import { Tags } from "ui-components/tags";
import DataCard from "./DataCard";
import { CardTitle } from "react-toolbox/lib/card";
import stateVar from "ui-lib/state_var";
import * as pathBuilder from "ui-lib/path_builder";

class JobSpecCard extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded)
        };
    }

    render() {
        const myItemPath = pathBuilder.fromType(this.props.item.type, this.props.item);

        return (
            <DataCard
                theme={this.props.theme}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
                path={this.props.clickable ? myItemPath : ""}
            >
                <CardTitle
                    title={`${this.props.item.name}`}
                />
                <If condition={this.state.expanded.value}>
                    <table className={this.props.theme.table}>
                        <tbody>
                            <tr>
                                <td>Name</td>
                                <td>
                                    <span className={this.props.theme.monospace}>
                                        {this.props.item.name}
                                    </span>
                                    <HiddenText
                                        className={this.props.theme.hiddenText}
                                        label="SHOW ID"
                                        text={this.props.item._id}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Slave&nbsp;criteria</td>
                                <td>
                                    <Choose>
                                        <When condition={this.props.item.criteria !== false}>
                                            {this.props.item.criteria}
                                        </When>
                                        <Otherwise>
                                            <div className={this.props.theme.noPropertyValue}>
                                                No criteria set
                                            </div>
                                        </Otherwise>
                                    </Choose>
                                </td>
                            </tr>
                            <If condition={this.props.item.script}>
                                <tr>
                                    <td>Script</td>
                                    <td>
                                        <span className={this.props.theme.codeLineWrap}>
                                            {this.props.item.script}
                                        </span>
                                    </td>
                                </tr>
                            </If>
                            <tr>
                                <td>Initial job tags</td>
                                <td>
                                    <Tags list={this.props.item.initialJobTags} />
                                </td>
                            </tr>
                            <tr>
                                <td>Created&nbsp;at</td>
                                <td>
                                    <DateTime
                                        value={this.props.item.created}
                                        niceDate={true}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Updated&nbsp;at</td>
                                <td>
                                    <DateTime
                                        value={this.props.item.saved}
                                        niceDate={true}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Tags</td>
                                <td>
                                    <Tags list={this.props.item.tags} />
                                </td>
                            </tr>
                            <If condition={this.props.showAdvanced}>
                                <tr>
                                    <td>Workspace Name</td>
                                    <td>
                                        <Choose>
                                            <When condition={this.props.item.workspaceName}>
                                                {this.props.item.workspaceName}
                                            </When>
                                            <Otherwise>
                                                No name specified
                                            </Otherwise>
                                        </Choose>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Workspace Cleanup Policy</td>
                                    <td>{this.props.item.workspaceCleanup}</td>
                                </tr>
                            </If>
                        </tbody>
                    </table>
                </If>
            </DataCard>
        );
    }
}

JobSpecCard.defaultProps = {
    expanded: false,
    expandable: true,
    clickable: false,
    showAdvanced: false
};

JobSpecCard.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    expanded: PropTypes.bool,
    expandable: PropTypes.bool,
    clickable: PropTypes.bool,
    showAdvanced: PropTypes.bool
};

JobSpecCard.contextTypes = {
    router: PropTypes.object.isRequired
};

export default JobSpecCard;
