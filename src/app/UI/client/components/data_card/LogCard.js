
import React from "react";
import LightComponent from "ui-lib/light_component";
import { CardTitle, CardText } from "react-toolbox/lib/card";
import HiddenText from "ui-components/hidden_text";
import DateTime from "ui-components/datetime";
import Tags from "ui-components/tags";
import ExpandableCard from "ui-components/expandable_card";
import UserAvatar from "ui-components/user_avatar";
import LogLines from "ui-observables/log_lines";
import stateVar from "ui-lib/state_var";

class LogCard extends LightComponent {
    constructor(props) {
        super(props);

        this.logLines = new LogLines({
            id: this.props.item._id,
            limit: 20
        });

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded),
            lines: this.logLines.value.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.logLines.start());
        this.addDisposable(this.logLines.value.subscribe((lines) => this.setState({ lines })));
    }

    componentWillReceiveProps(nextProps) {
        this.logLines.setOpts({
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
                            defaultUrl="/Cheser/48x48/mimetypes/text-x-generic.png"
                        />
                    )}
                    title={this.props.item.name}
                    subtitle={(
                        <DateTime
                            value={this.props.item.saved}
                            niceDate={true}
                        />
                    )}
                />
                <CardText>
                    <span className={this.props.theme.log}>
                        {this.state.lines.toJS().join("\n")}
                    </span>
                </CardText>
                {this.state.expanded.value && (
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
                                <td>Created at</td>
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
                )}
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
