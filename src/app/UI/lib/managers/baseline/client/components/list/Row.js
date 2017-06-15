
import React from "react";
import PropTypes from "prop-types";
import { StatusIcon } from "ui-components/status";
import { DateTime } from "ui-components/datetime";

class Row extends React.PureComponent {
    render() {
        const item = this.props.item;

        return (
            <tr
                key={item._id}
                onClick={() => this.props.onClick(item)}
                className={this.props.theme[item.status]}
            >
                <td>
                    {item.name}
                </td>
                <td>
                    {item.baselineType}
                </td>
                <td>
                    <DateTime value={item.created} />
                </td>
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
