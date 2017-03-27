
import React from "react";
import LightComponent from "ui-lib/light_component";
import { CardTitle } from "react-toolbox/lib/card";
import { IconButton } from "react-toolbox/lib/button";
import DateTime from "ui-components/datetime";
import Tags from "ui-components/tags";
import ExpandableCard from "ui-components/expandable_card";
import stateVar from "ui-lib/state_var";
import * as pathBuilder from "ui-lib/path_builder";

class PolicyCard extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded)
        };
    }

    render() {
        // Instantiate link button if not already on link destination
        const myItemPath = pathBuilder.fromType("userrepo.policy", this.props.item);
        let openItemLinkButton;
        if (!this.context.router.isActive(myItemPath)) {
            openItemLinkButton = (
                <IconButton
                    icon="open_in_browser"
                    onClick={() => {
                        this.context.router.push({
                            pathname: myItemPath
                        });
                    }}
                />
            );
        }

        return (
            <ExpandableCard
                className={this.props.theme.card}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
            >
                <CardTitle
                    title={(
                        <div>
                            {this.props.item._id}
                            {openItemLinkButton}
                        </div>
                    )}
                />
                <If condition={this.state.expanded.value}>
                    <table className={this.props.theme.table}>
                        <tbody>
                            <tr>
                                <td>Description</td>
                                <td>{this.props.item.description}</td>
                            </tr>
                            <tr>
                                <td>Privileges</td>
                                <td>
                                    <Tags list={this.props.item.privileges} />
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
                        </tbody>
                    </table>
                </If>
            </ExpandableCard>
        );
    }
}

PolicyCard.defaultProps = {
    expanded: false,
    expandable: true
};

PolicyCard.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool
};

PolicyCard.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default PolicyCard;
