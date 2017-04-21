
import React from "react";
import PropTypes from "prop-types";
import DeleteIcon from "material-design-icons/action/svg/production/ic_delete_48px.svg";
import EditIcon from "material-design-icons/image/svg/production/ic_edit_48px.svg";
import { sizes, filters } from "ui-components/svg_grid";

class StepGeneric extends React.Component {
    constructor(props) {
        super(props);

        this.horizontalMargin = 7;
        this.verticalMargin = sizes.gridSize / 2;
        this.horizontalPadding = 30;
        this.verticalPadding = 10;
    }

    render() {
        const x = this.horizontalMargin;
        const y = this.verticalMargin;
        const w = (sizes.gridSize * this.props.item.columnSpan) - (this.horizontalMargin * 2);
        const h = (sizes.gridSize * this.props.item.rowSpan) - (this.verticalMargin * 2);
        const selectedClassName = this.props.item.active() ? this.props.theme.genericBoxSelected : "";
        const unselectableClassName = this.props.item.disabled() ? this.props.theme.genericBoxUnselectable : "";
        const secondaryClassName = this.props.item.secondary ? this.props.theme.genericBoxSecondary : "";


        let removeIcon;
        let editIcon;

        if (this.props.item.handlers.onRemove) {
            removeIcon = (
                <g
                    className={this.props.theme.button}
                    onClick={(event) => {
                        event.stopPropagation();
                        this.props.item.handlers.onRemove();
                    }}
                >
                    <rect
                        className={this.props.theme.background}
                        x={w - 66 - 5}
                        y={(h / 2) - 5}
                        width={48 + 10}
                        height={48 + 10}
                        rx={5}
                        ry={5}
                    />
                    <DeleteIcon
                        className={this.props.theme.icon}
                        x={w - 66 + 6}
                        y={(h / 2) + 6}
                        width={36}
                        height={36}
                    />
                </g>
            );
        }

        if (this.props.item.handlers.onEdit) {
            editIcon = (
                <g
                    className={this.props.theme.button}
                    onClick={(event) => {
                        event.stopPropagation();
                        this.props.item.handlers.onEdit();
                    }}
                >
                    <rect
                        className={this.props.theme.background}
                        x={w - 130 - 5}
                        y={(h / 2) - 5}
                        width={48 + 10}
                        height={48 + 10}
                        rx={5}
                        ry={5}
                    />
                    <EditIcon
                        className={this.props.theme.icon}
                        x={w - 130 + 6}
                        y={(h / 2) + 6}
                        width={36}
                        height={36}
                    />
                </g>
            );
        }

        return (
            <g
                className={`${this.props.theme.genericBox} ${selectedClassName} ${unselectableClassName} ${secondaryClassName}`}
            >
                <rect
                    className={this.props.theme.rect}
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx={5}
                    ry={5}
                    filter={`url(#${filters.SHADOW})`}
                />
                <rect
                    className={this.props.theme.rectSelector}
                    x={x}
                    y={y}
                    width={6}
                    height={h}
                    rx={5}
                    ry={5}
                />
                {editIcon}
                {removeIcon}
                <text
                    className={this.props.theme.text}
                    x={this.horizontalPadding + this.horizontalMargin}
                    y={this.verticalPadding + this.verticalMargin + (h / 2)}
                >
                    {this.props.item.name}
                </text>
            </g>
        );
    }
}

StepGeneric.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired
};

export default StepGeneric;
