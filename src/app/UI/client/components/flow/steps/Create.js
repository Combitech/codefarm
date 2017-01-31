
import React from "react";
import { sizes } from "ui-components/svg_grid";

class Create extends React.Component {
    constructor(props) {
        super(props);

        this.horizontalMargin = 7;
        this.verticalMargin = (sizes.gridSize / 2) + 10;
        this.horizontalPadding = 40;
        this.verticalPadding = 10;
    }

    render() {
        const barw = 4;
        const x = this.horizontalMargin + barw;
        const y = this.verticalMargin;
        const w = 260;
        const h = (sizes.gridSize * this.props.item.rowSpan) - (this.verticalMargin * 2);

        return (
            <g
                className={this.props.theme.createBox}
            >
                <rect
                    className={this.props.theme.rectBackground}
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                />
                <rect
                    className={this.props.theme.rect}
                    x={x + 20}
                    y={y}
                    width={w}
                    height={h}
                    rx={5}
                    ry={5}
                />
                <rect
                    className={this.props.theme.rectBar}
                    x={x}
                    y={y}
                    width={barw}
                    height={h}
                />
                <text
                    className={this.props.theme.text}
                    x={this.horizontalPadding + this.horizontalMargin + 20}
                    y={this.verticalPadding + this.verticalMargin + (h / 2)}
                >
                    {this.props.item.name}
                </text>
            </g>
        );
    }
}

Create.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired
};

export default Create;
