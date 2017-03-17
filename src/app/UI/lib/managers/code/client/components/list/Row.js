
import React from "react";
import ImmutablePropTypes from "react-immutable-proptypes";
import UserAvatar from "ui-components/user_avatar";
import { StatusIcon } from "ui-components/status";
import DateTime from "ui-components/datetime";

class Row extends React.PureComponent {
    render() {
        const revision = this.props.item.toJS();
        const latestPatch = revision.patches[revision.patches.length - 1];
        const className = this.props.theme[revision.status];
        const status = (step) => {
            if (revision.tags.includes(`step:${step.name}:success`)) {
                return "success";
            } else if (revision.tags.includes(`step:${step.name}:fail`)) {
                return "fail";
            } else if (revision.tags.includes(`step:${step.name}:skip`)) {
                return "skip";
            } else if (revision.tags.includes(`step:${step.name}:aborted`)) {
                return "aborted";
            } else if (revision.refs.find((ref) => ref.name === step.name)) {
                return "ongoing";
            }

            return "unknown";
        };


        return (
            <tr
                key={revision._id}
                onClick={() => this.props.onClick(revision)}
                className={className}
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
                            this.props.onClick(revision, step.name);
                        }}
                    >
                        <StatusIcon
                            className={this.props.theme.statusIcon}
                            status={status(step)}
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
