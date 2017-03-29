
import React from "react";
import LightComponent from "ui-lib/light_component";
import { CardTitle, CardText } from "react-toolbox/lib/card";
import HiddenText from "ui-components/hidden_text";
import DateTime from "ui-components/datetime";
import Tags from "ui-components/tags";
import ExpandableCard from "ui-components/expandable_card";
import UserAvatar from "ui-components/user_avatar";
import stateVar from "ui-lib/state_var";
import { LogLines } from "ui-components/log_viewer";
import CardLinkIcon from "./CardLinkIcon";

class LogCard extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded)
        };
    }

    render() {
        const myItemPath = `/logrepo/log/${this.props.item._id}/download`;

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
                            defaultUrl="/Cheser/48x48/mimetypes/text-x-generic.png"
                        />
                    )}
                    title={(
                        <div>
                            {this.props.item.name}
                            <CardLinkIcon
                                theme={this.props.theme}
                                path={myItemPath}
                                name="log"
                                openInNew={true}
                            />
                        </div>
                    )}
                    subtitle={(
                        <DateTime
                            value={this.props.item.saved}
                            niceDate={true}
                        />
                    )}
                />
                <If condition={this.state.expanded.value}>
                    <CardText>
                        <LogLines id={this.props.item._id} />
                    </CardText>
                    <table className={this.props.theme.table}>
                        <tbody>
                            <tr>
                                <td>State</td>
                                <td>
                                    {this.props.item.state}
                                </td>
                            </tr>
                            <tr>
                                <td>Name</td>
                                <td className={this.props.theme.monospace}>
                                    {this.props.item.name}
                                    <HiddenText
                                        className={this.props.theme.hiddenText}
                                        label="SHOW ID"
                                        text={this.props.item._id}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Repository</td>
                                <td>{this.props.item.repository}</td>
                            </tr>
                            <tr>
                                <td>Size</td>
                                <td>{this.props.item.fileMeta.size}</td>
                            </tr>
                            <tr>
                                <td>Mimetype</td>
                                <td>{this.props.item.fileMeta.mimeType}</td>
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

LogCard.defaultProps = {
    expanded: false,
    expandable: true
};

LogCard.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool
};

export default LogCard;
