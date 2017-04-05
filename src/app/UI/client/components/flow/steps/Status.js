
import React from "react";
import LightComponent from "ui-lib/light_component";
import { sizes } from "ui-components/svg_grid";
import statusIcons from "ui-lib/status_icons";

class Status extends LightComponent {
    constructor(props) {
        super(props);

        this.borderSize = 0;
        this.boxVerticalMargin = 20;
        this.verticalMargin = 6;
        this.horizontalMargin = 8;
        this.iconMargin = -12;
        this.fontSize = 25;
    }

    render() {
        this.log("render", this.props, JSON.stringify(this.state, null, 2));

        const width = sizes.gridSize * this.props.item.columnSpan;
        const height = sizes.gridSize * this.props.item.rowSpan;
        const verticalMiddle = (height / 2);

        const circleRadius = (height / 2) - this.verticalMargin;
        const circleCenterX = circleRadius + this.horizontalMargin;
        const circleCenterY = verticalMiddle;

        const boxHeight = height - ((this.boxVerticalMargin + this.verticalMargin) * 2);
        const boxWidth = width - circleCenterX - this.verticalMargin;
        const boxX = circleCenterX;
        const boxY = verticalMiddle - (boxHeight / 2);

        const textX = ((circleRadius + this.borderSize) * 2) + (this.horizontalMargin * 4);
        const textY = verticalMiddle + (this.fontSize / 2);
        const textWidth = circleCenterX * 2;
        const textHeight = this.fontSize;

        const iconSize = (circleRadius - this.iconMargin) * 2;
        const iconX = circleCenterX - (iconSize / 2);
        const iconY = circleCenterY - (iconSize / 2);

        const selectedClassName = this.props.item.active() ? this.props.theme.statusBoxSelected : "";

        const status = this.props.item.meta.job ? this.props.item.meta.job.status : (this.props.item.meta.status || "unknown");
        const statusIcon = statusIcons[status];

        return (
            <g
                className={`${this.props.theme.statusBox} ${selectedClassName}`}
            >
                <rect
                    className={this.props.theme.rect}
                    width={boxWidth}
                    height={boxHeight}
                    x={boxX}
                    y={boxY}
                    filter={`url(#${this.props.shadowId})`}
                />
                <image
                    className={this.props.theme.icon}
                    x={iconX}
                    y={iconY}
                    width={iconSize}
                    height={iconSize}
                    href={statusIcons.shadow}
                />
                {statusIcon.map((icon, index) => {
                    const statusClassName = `${status}-${index}`;
                    const iconClassName = `icon-${index}`;

                    return (
                        <svg
                            key={icon}
                            width={iconSize}
                            height={iconSize}
                            x={iconX}
                            y={iconY}
                        >
                            <g
                                className={`${this.props.theme[status]} ${this.props.theme[statusClassName]}`}
                                style={{ transformOrigin: `${iconSize / 2}px ${iconSize / 2}px` }}
                            >
                                <image
                                    className={`${this.props.theme.icon} ${this.props.theme[iconClassName]}`}

                                    width={iconSize}
                                    height={iconSize}
                                    href={icon}
                                />
                            </g>
                        </svg>
                    );
                })}
                <text
                    className={this.props.theme.text}
                    width={textWidth}
                    height={textHeight}
                    x={textX}
                    y={textY}
                    style={{}}
                >
                    {this.props.item.name}
                </text>
            </g>
        );
    }
}

Status.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    job: React.PropTypes.object,
    shadowId: React.PropTypes.string
};

export default Status;
