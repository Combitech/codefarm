
import React from "react";
import PropTypes from "prop-types";
import { flattenArray } from "misc";
import LightComponent from "ui-lib/light_component";
import SvgGridItem from "./SvgGridItem";
import SvgGridPath from "./SvgGridPath";
import SvgGridDefs from "./SvgGridDefs";
import sizes from "./sizes";
import ShadowFilter from "./filters/Shadow";

class SvgGrid extends LightComponent {
    buildPath(gridPath, fromItem, toItem) {
        const pathStyle = {};

        if (gridPath.props.markerStart) {
            pathStyle.markerStart = `url(#${gridPath.props.markerStart})`;
        }
        if (gridPath.props.markerEnd) {
            pathStyle.markerEnd = `url(#${gridPath.props.markerEnd})`;
        }
        if (gridPath.props.markerMid) {
            pathStyle.markerMid = `url(#${gridPath.props.markerMid})`;
        }

        const fromCenter = {
            x: fromItem.props.x + (fromItem.props.width / 2),
            y: fromItem.props.y + (fromItem.props.height / 2)
        };
        const toCenter = {
            x: toItem.props.x + (toItem.props.width / 2),
            y: toItem.props.y + (toItem.props.height / 2)
        };

        // console.log("fromCenter", fromCenter, fromItem.props);
        // console.log("toCenter", toCenter, toItem.props);

        const from = { x: 0, y: 0 };
        const to = { x: 0, y: 0 };
        let edge;

        let hDir = "none";
        hDir = fromCenter.x < toCenter.x ? "right" : hDir;
        hDir = fromCenter.x > toCenter.x ? "left" : hDir;
        let vDir = "none";
        vDir = fromCenter.y < toCenter.y ? "down" : vDir;
        vDir = fromCenter.y > toCenter.y ? "up" : vDir;

        if (hDir === "right") {
            from.x = fromItem.props.x + fromItem.props.width;
            from.y = fromCenter.y;
            to.x = toItem.props.x;
            to.y = toCenter.y;
            edge = "vertical";
        } else if (hDir === "left") {
            from.x = fromItem.props.x;
            from.y = fromCenter.y;
            to.x = toItem.props.x + toItem.props.width;
            to.y = toCenter.y;
            edge = "vertical";
        } else if (vDir === "down") {
            from.x = fromCenter.x;
            from.y = fromItem.props.y + fromItem.props.height;
            to.x = toCenter.x;
            to.y = toItem.props.y;
            edge = "horizontal";
        } else if (vDir === "up") {
            from.x = fromCenter.x;
            from.y = fromItem.props.y;
            to.x = toCenter.x;
            to.y = toItem.props.y + toItem.props.height;
            edge = "horizontal";
        } else {
            throw new Error(`From and to items are in the same row and column on path ${gridPath.key}`);
        }

        /* Move connection endpoint of to item from
         * item vertical edge to item horizontal edge if vertically aligned
         * to support items in neighbouring columns */
        let columnNeighbours = false;
        if (from.x === to.x) {
            to.x = toCenter.x;
            to.y = toItem.props.y;
            if (vDir === "up") {
                to.y += toItem.props.height;
            }
            columnNeighbours = true;
        }

        const middlePoints = [];

        if (edge === "vertical") {
            if (columnNeighbours) {
                // We only need one "elbow" on the connector if
                // items in neighbouring columns.
                middlePoints.push({
                    x: to.x,
                    y: from.y
                });
            } else {
                const diffX = (to.x - from.x) / 2;
                middlePoints.push({
                    x: from.x + diffX,
                    y: from.y
                });
                middlePoints.push({
                    x: to.x - diffX,
                    y: to.y
                });
            }
        } else if (edge === "horizontal") {
            const diffY = (to.y - from.y) / 2;
            middlePoints.push({
                x: from.x,
                y: from.y + diffY
            });
            middlePoints.push({
                x: to.x,
                y: to.y - diffY
            });
        }

        // Add margins around to-item in order to make room for end marker.
        // If stroke-width is big, the arrow point is looking dull...
        const toItemMargin = gridPath.props.toMargin || 0;
        if (!columnNeighbours && hDir === "right") {
            to.x = to.x - toItemMargin;
        } else if (!columnNeighbours && hDir === "left") {
            to.x = to.x + toItemMargin;
        } else if (vDir === "down") {
            to.y = to.y - toItemMargin;
        } else if (vDir === "up") {
            to.y = to.y + toItemMargin;
        }

        // Add margins around from-item in order to make room for start marker.
        // If stroke-width is big, the arrow point is looking dull...
        const fromItemMargin = gridPath.props.fromMargin || 0;
        if (!columnNeighbours && hDir === "right") {
            from.x = from.x + fromItemMargin;
        } else if (!columnNeighbours && hDir === "left") {
            from.x = from.x - fromItemMargin;
        } else if (vDir === "down") {
            from.y = from.y + fromItemMargin;
        } else if (vDir === "up") {
            from.y = from.y - fromItemMargin;
        }

        const points = [
            from,
            ...middlePoints,
            to
        ];

        // console.log("edge", edge);
        // console.log("connector points", points);

        const calcPath = (points) => {
            const pathItems = [];

            pathItems.push(`M${points[0].x},${points[0].y}`);
            pathItems.push(`C${points[1].x},${points[1].y}`);

            for (let i = 2; i < points.length; i++) {
                pathItems.push(`${points[i].x},${points[i].y}`);
            }

            return pathItems.join(" ");
        };

        return (
            <path
                d={calcPath(points)}
                style={pathStyle}
                className={this.props.theme.path}
                key={gridPath.key}
            />
        );
    }

    render() {
        const getItemInfo = (column, row, columnSpan = 1, rowSpan = 1) => {
            const w = this.props.width / this.props.columns;
            const h = this.props.height / this.props.rows;
            const x = w * column;
            const y = h * row;
            const width = w * columnSpan;
            const height = h * rowSpan;

            return {
                width: width,
                height: height,
                x: x,
                y: y,
                columnSpan: columnSpan,
                rowSpan: rowSpan
            };
        };

        // Children might be an n-dimensional-array, flatten it
        const children = flattenArray(
            this.props.children instanceof Array ? this.props.children : [ this.props.children ]
        );

        // console.log("children", children);

        const items = children
        .filter((child) => child.type === SvgGridItem)
        .map((item) => {
            const info = getItemInfo(item.props.column, item.props.row, item.props.columnSpan, item.props.rowSpan);

            let border;
            if (item.props.border) {
                border = (<rect x={0} y={0} width={sizes.gridSize * info.columnSpan} height={sizes.gridSize * info.rowSpan} className={this.props.theme.gridBox} />);
            }

            return (
                <svg
                    width={info.width}
                    height={info.height}
                    x={info.x}
                    y={info.y}
                    viewBox={`0 0 ${sizes.gridSize * info.columnSpan} ${sizes.gridSize * info.rowSpan}`}
                    preserveAspectRatio="none"
                    key={item.key}
                >
                    {border}
                    {item}
                </svg>
            );
        });

        const paths = children
        .filter((child) => child.type === SvgGridPath)
        .map((gridPath) => {
            const fromItem = items.find((item) => item.key === gridPath.props.fromKey);
            const toItem = items.find((item) => item.key === gridPath.props.toKey);

            return this.buildPath(gridPath, fromItem, toItem);
        });

        // Find all SvgGridDefs and concat childrens (they are the defs to use)
        const defs = flattenArray(
            children
                .filter((child) => child.type === SvgGridDefs)
                .map((def) => def.props.children)
        );


        let border = "";
        if (this.props.border) {
            border = (
                <rect
                    width={this.props.width}
                    height={this.props.height}
                    x={0}
                    y={0}
                    className={this.props.theme.gridBox}
                />
            );
        }

        // console.log("items", items);
        // console.log("paths", paths);
        // console.log("defs", defs);

        // markerUnits set userSpaceOnUse to not scale marker with stroke-width
        return (
            <svg
                width={this.props.width}
                height={this.props.height}
                style={this.props.style}
                className={this.props.theme.svgGrid}
            >
                <defs>
                    <ShadowFilter />
                    {defs}
                </defs>
                {border}
                {paths}
                {items}
            </svg>
        );
    }
}

SvgGrid.propTypes = {
    children: PropTypes.node,
    theme: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    columns: PropTypes.number.isRequired,
    rows: PropTypes.number.isRequired,
    border: PropTypes.bool,
    style: PropTypes.object
};

export default SvgGrid;
