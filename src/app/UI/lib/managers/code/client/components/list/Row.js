
import React from "react";
import PropTypes from "prop-types";
import { UserAvatar } from "ui-components/user_avatar";
import { StatusIcon } from "ui-components/status";
import { DateTime } from "ui-components/datetime";

class Row extends React.PureComponent {
    render() {
        const item = this.props.item;
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
                <For each="step" of={this.props.steps}>
                    <td
                        className={this.props.theme.runColumn}
                        key={step.id}
                        onClick={step.onClick}
                    >
                        <StatusIcon
                            className={this.props.theme.statusIcon}
                            status={step.status}
                            size={24}
                        />
                    </td>
                </For>
            </tr>
        );
    }
}

Row.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    steps: PropTypes.array.isRequired,
    onClick: PropTypes.func
};

export default Row;
