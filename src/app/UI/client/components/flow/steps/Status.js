
import React from "react";
import Component from "ui-lib/component";
import { sizes, filters } from "ui-components/svg_grid";

const clock = [
    "/Cheser/extras/255x255/status/status-clock-face.png",
    "/Cheser/extras/255x255/status/status-clock-large.png",
    "/Cheser/extras/255x255/status/status-clock-small.png",
    "/Cheser/extras/255x255/status/status-clock-face-center.png"
];

const statusIcons = {
    unknown: [ "/Cheser/extras/255x255/status/status-unknown.png" ],
    queued: clock,
    allocated: clock,
    ongoing: clock,
    success: [ "/Cheser/extras/255x255/status/status-success.png" ],
    aborted: [ "/Cheser/extras/255x255/status/status-aborted.png" ],
    fail: [ "/Cheser/extras/255x255/status/status-fail.png" ],
    skip: [ "/Cheser/extras/255x255/status/status-skip.png" ],
    neutral: [ "/Cheser/extras/255x255/status/status-neutral.png" ],
    happy: [ "/Cheser/extras/255x255/status/status-happy.png" ],
    unhappy: [ "/Cheser/extras/255x255/status/status-unhappy.png" ],
    shadow: [ "/Cheser/extras/255x255/status/status-shadow.png" ]
};

class Status extends Component {
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
                    filter={`url(#${filters.SHADOW})`}
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
                        <g
                            key={icon}
                            className={`${this.props.theme[status]} ${this.props.theme[statusClassName]}`}
                            width={iconSize}
                            height={iconSize}
                        >
                            <image
                                className={`${this.props.theme.icon} ${this.props.theme[iconClassName]}`}
                                x={iconX}
                                y={iconY}
                                width={iconSize}
                                height={iconSize}
                                href={icon}
                            />
                        </g>
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
    job: React.PropTypes.object
};

export default Status;
