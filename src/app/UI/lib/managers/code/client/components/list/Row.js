
import React from "react";
import ImmutablePropTypes from "react-immutable-proptypes";
import UserAvatar from "ui-components/user_avatar";
import { StatusIcon } from "ui-components/status";
import statuslib from "ui-lib/statuslib";
import DateTime from "ui-components/datetime";

class Row extends React.PureComponent {
    render() {
        const item = this.props.item.toJS();
        const latestPatch = item.patches[item.patches.length - 1];

        return (
            <tr
                key={item._id}
                onClick={() => this.props.onClick(item)}
                className={this.props.theme[item.status]}
            >
                <td className={this.props.theme.monospace}>
                    {latestPatch.change.newrev.substr(0, 7)}
                </td>
                <td>
                    <DateTime value={latestPatch.submitted} />
                </td>
                <td>
                    <UserAvatar
                        className={this.props.theme.avatar}
                        userId={latestPatch.userRef ? latestPatch.userRef.id : false}
                    />
                    {latestPatch.name}
                </td>
                <td>{latestPatch.comment.split("\n", 1)[0]}</td>
                <For each="step" of={this.props.steps.toJS()}>
                    <td
                        className={this.props.theme.runColumn}
                        key={step.name}
                        onClick={(event) => {
                            event.stopPropagation();
                            this.props.onClick(item, step.name);
                        }}
                    >
                        <StatusIcon
                            className={this.props.theme.statusIcon}
                            status={statuslib.guess(item, step.name)}
                            size={24}
                        />
                    </td>
                </For>
            </tr>
        );
    }
}

Row.propTypes = {
    theme: React.PropTypes.object,
    item: ImmutablePropTypes.map.isRequired,
    steps: ImmutablePropTypes.list,
    onClick: React.PropTypes.func
};

export default Row;
