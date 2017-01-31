
import React from "react";
import Component from "ui-lib/component";
import { sizes, filters } from "ui-components/svg_grid";
import { flattenArray } from "misc";

const statusIcons = {
    unknown: "/Cheser/256x256/status/dialog-question.png",
    queued: "/Cheser/256x256/actions/document-open-recent.png",
    allocated: "/Cheser/256x256/actions/document-open-recent.png",
    ongoing: "/Cheser/256x256/status/appointment-soon.png",
    success: "/Cheser/256x256/emblems/emblem-default.png",
    aborted: "/Cheser/256x256/status/dialog-warning.png",
    fail: "/Cheser/256x256/emblems/emblem-dropbox-unsyncable.png",
    skip: "/Cheser/256x256/actions/system-log-out.png",
    neutral: "/Cheser/256x256/emotes/face-plain.png",
    happy: "/Cheser/256x256/emotes/face-laugh.png",
    unhappy: "/Cheser/256x256/emotes/face-crying.png"
};

class Status extends Component {
    constructor(props) {
        super(props);

        this.borderSize = 0;
        this.boxVerticalMargin = 20;
        this.verticalMargin = 8;
        this.horizontalMargin = 8;
        this.iconMargin = 20;
        this.fontSize = 25;

        // TODO: We can only show one, how do we select which?
        this.addTypeItemStateVariable("job", "exec.job", (props) => {
            if (props.baselines.length === 0) {
                return false;
            }

            return flattenArray(
                props.baselines
                .map((baseline) => baseline.tags))
                .filter((tag) => tag.startsWith("job:"))
                .map((tag) => tag.replace("job:", "")
            )[0] || false;
        }, true);
    }

    render() {
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

        const status = this.state.job ? this.state.job.status : (this.props.item.meta.status || "unknown");
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

                <circle
                    className={this.props.theme.circle}
                    cx={circleCenterX}
                    cy={circleCenterY}
                    r={circleRadius}
                    filter={`url(#${filters.SHADOW})`}
                />
                <g
                    className={this.props.theme[status]}
                    width={iconSize}
                    height={iconSize}
                >
                    <image
                        className={this.props.theme.icon}
                        x={iconX}
                        y={iconY}
                        width={iconSize}
                        height={iconSize}
                        href={statusIcon}
                    />
                </g>
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

Status.defaultProps = {
    baselines: []
};

Status.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    baselines: React.PropTypes.array
};

export default Status;
