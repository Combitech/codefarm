
import React from "react";
import ImmutablePropTypes from "react-immutable-proptypes";
import { StatusIcon } from "ui-components/status";
import statuslib from "ui-lib/statuslib";
import { DateTime } from "ui-components/datetime";

class Row extends React.PureComponent {
    render() {
        const item = this.props.item.toJS();

        return (
            <tr
                key={item._id}
                onClick={() => this.props.onClick(item)}
                className={this.props.theme[item.state]}
            >
                <td>
                    {item.version}
                </td>
                <td>
                    <DateTime value={item.created} />
                </td>
                <td>
                    {item.state}
                </td>
                <td>
                    {item.name}
                </td>
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
