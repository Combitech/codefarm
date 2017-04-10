
import React from "react";
import SvgGrid from "./SvgGrid";
import SvgGridItem from "./SvgGridItem";
import SvgGridPath from "./SvgGridPath";
import SvgGridDefs from "./SvgGridDefs";
import SvgGridArrowMarkerDef from "./SvgGridArrowMarkerDef";

class SvgGridExample extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const gridWidth = 1000;
        const gridHeight = 500;
        const gridCols = 10;
        const gridRows = 5;
        const item = {
            cx: (gridWidth / gridCols) / 2,
            cy: (gridHeight / gridRows) / 2
        };

        const ARROW1_LEN = 15;
        const ARROW2_LEN = 8;
        const START_ARROW1_LEN = 10;

        return (
            <SvgGrid
                theme={this.props.theme}
                width={gridWidth}
                height={gridHeight}
                columns={gridCols}
                rows={gridRows}
                border={true}
            >
                <SvgGridDefs>
                    <SvgGridArrowMarkerDef id="arrow1" color="magenta" width={ARROW1_LEN} />
                    <SvgGridArrowMarkerDef id="arrow2" color="red" width={ARROW2_LEN} />
                    <SvgGridArrowMarkerDef id="startArrow1" isStart={true} color="blue" width={START_ARROW1_LEN} />
                    <marker
                        id="circle"
                        markerWidth="8"
                        markerHeight="8"
                        refX="4"
                        refY="4">
                        <circle cx="4" cy="4" r="4" stroke="none" fill="#f00"/>
                    </marker>
                </SvgGridDefs>

                <SvgGridPath theme={this.props.theme} key="A" fromKey={"from"} toKey={"topleft"} />
                <SvgGridPath theme={this.props.theme} key="B" fromKey={"from"} toKey={"top"} />
                <SvgGridPath theme={this.props.theme} key="C" fromKey={"from"} toKey={"topright"}
                    markerStart="startArrow1" fromMargin={START_ARROW1_LEN} />
                <SvgGridPath theme={this.props.theme} key="D" fromKey={"from"} toKey={"right"} />
                <SvgGridPath theme={this.props.theme} key="E" fromKey={"from"} toKey={"bottomright"}
                    markerMid="circle" />
                <SvgGridPath theme={this.props.theme} key="F" fromKey={"from"} toKey={"bottom"} />
                <SvgGridPath theme={this.props.theme} key="G" fromKey={"from"} toKey={"bottomleft"} />
                <SvgGridPath theme={this.props.theme} key="H" fromKey={"from"} toKey={"left"}
                    markerEnd="arrow1" toMargin={ARROW1_LEN} />

                <SvgGridPath theme={this.props.theme} key="I" fromKey={"from2"} toKey={"topleft2"}
                    style={{ strokeWidth: 4, strokeDasharray: "10,4" }} />
                <SvgGridPath theme={this.props.theme} key="J" fromKey={"from2"} toKey={"topright2"}
                    markerEnd="arrow2" toMargin={ARROW2_LEN} />
                <SvgGridPath theme={this.props.theme} key="K" fromKey={"from2"} toKey={"bottomleft2"}
                    style={{ shapeRendering: "geometricPrecision" }} />
                <SvgGridPath theme={this.props.theme} key="L" fromKey={"from2"} toKey={"bottomright2"}
                    style={{ strokeWidth: 3, stroke: "green" }} />

                <SvgGridPath theme={this.props.theme} key="M" fromKey={"bottomleft2"} toKey={"bottomright3"}
                    style={{ strokeWidth: 2 }}
                    markerEnd="arrow1" markerMid="circle" toMargin={ARROW1_LEN} />

                <SvgGridItem
                    theme={this.props.theme}
                    row={2}
                    column={2}
                    columnSpan={1}
                    rowSpan={1}
                    key={"from"}
                    border={true}
                >
                    <text x={item.cx} y={item.cy} fontSize={20} textAnchor="middle" alignmentBaseline="central">1,1</text>
                </SvgGridItem>

                <SvgGridItem
                    theme={this.props.theme}
                    row={0}
                    column={0}
                    columnSpan={1}
                    rowSpan={1}
                    key={"topleft"}
                    border={true}
                >
                    <text x={item.cx} y={item.cy} fontSize={20} textAnchor="middle" alignmentBaseline="central">0,0</text>
                </SvgGridItem>

                <SvgGridItem
                    theme={this.props.theme}
                    row={0}
                    column={2}
                    columnSpan={1}
                    rowSpan={1}
                    key={"top"}
                    border={true}
                >
                    <text x={item.cx} y={item.cy} fontSize={20} textAnchor="middle" alignmentBaseline="central">1,0</text>
                </SvgGridItem>

                <SvgGridItem
                    theme={this.props.theme}
                    row={0}
                    column={4}
                    columnSpan={1}
                    rowSpan={1}
                    key={"topright"}
                    border={true}
                >
                    <text x={item.cx} y={item.cy} fontSize={20} textAnchor="middle" alignmentBaseline="central">2,0</text>
                </SvgGridItem>

                <SvgGridItem
                    theme={this.props.theme}
                    row={2}
                    column={4}
                    columnSpan={1}
                    rowSpan={1}
                    key={"right"}
                    border={true}
                >
                    <text x={item.cx} y={item.cy} fontSize={20} textAnchor="middle" alignmentBaseline="central">2,1</text>
                </SvgGridItem>

                <SvgGridItem
                    theme={this.props.theme}
                    row={4}
                    column={4}
                    columnSpan={1}
                    rowSpan={1}
                    key={"bottomright"}
                    border={true}
                >
                    <text x={item.cx} y={item.cy} fontSize={20} textAnchor="middle" alignmentBaseline="central">2,2</text>
                </SvgGridItem>

                <SvgGridItem
                    theme={this.props.theme}
                    row={4}
                    column={2}
                    columnSpan={1}
                    rowSpan={1}
                    key={"bottom"}
                    border={true}
                >
                    <text x={item.cx} y={item.cy} fontSize={20} textAnchor="middle" alignmentBaseline="central">1,2</text>
                </SvgGridItem>

                <SvgGridItem
                    theme={this.props.theme}
                    row={4}
                    column={0}
                    columnSpan={1}
                    rowSpan={1}
                    key={"bottomleft"}
                    border={true}
                >
                    <text x={item.cx} y={item.cy} fontSize={20} textAnchor="middle" alignmentBaseline="central">0,2</text>
                </SvgGridItem>

                <SvgGridItem
                    theme={this.props.theme}
                    row={2}
                    column={0}
                    columnSpan={1}
                    rowSpan={1}
                    key={"left"}
                    border={true}
                >
                    <text x={item.cx} y={item.cy} fontSize={20} textAnchor="middle" alignmentBaseline="central">0,1</text>
                </SvgGridItem>

                <SvgGridItem
                    theme={this.props.theme}
                    row={2}
                    column={7}
                    columnSpan={1}
                    rowSpan={1}
                    key={"from2"}
                    border={true}
                >
                    <text x={item.cx} y={item.cy} fontSize={20} textAnchor="middle" alignmentBaseline="central">7,2</text>
                </SvgGridItem>

                <SvgGridItem
                    theme={this.props.theme}
                    row={1}
                    column={6}
                    columnSpan={1}
                    rowSpan={1}
                    key={"topleft2"}
                    border={true}
                >
                    <text x={item.cx} y={item.cy} fontSize={20} textAnchor="middle" alignmentBaseline="central">6,1</text>
                </SvgGridItem>

                <SvgGridItem
                    theme={this.props.theme}
                    row={1}
                    column={8}
                    columnSpan={1}
                    rowSpan={1}
                    key={"topright2"}
                    border={true}
                >
                    <text x={item.cx} y={item.cy} fontSize={20} textAnchor="middle" alignmentBaseline="central">8,1</text>
                </SvgGridItem>

                <SvgGridItem
                    theme={this.props.theme}
                    row={3}
                    column={6}
                    columnSpan={1}
                    rowSpan={1}
                    key={"bottomleft2"}
                    border={true}
                >
                    <text x={item.cx} y={item.cy} fontSize={20} textAnchor="middle" alignmentBaseline="central">6,3</text>
                </SvgGridItem>

                <SvgGridItem
                    theme={this.props.theme}
                    row={3}
                    column={8}
                    columnSpan={1}
                    rowSpan={1}
                    key={"bottomright2"}
                    border={true}
                >
                    <text x={item.cx} y={item.cy} fontSize={20} textAnchor="middle" alignmentBaseline="central">8,3</text>
                </SvgGridItem>

                <SvgGridItem
                    theme={this.props.theme}
                    row={4}
                    column={9}
                    columnSpan={1}
                    rowSpan={1}
                    key={"bottomright3"}
                    border={true}
                >
                    <text x={item.cx} y={item.cy} fontSize={20} textAnchor="middle" alignmentBaseline="central">9,4</text>
                </SvgGridItem>
            </SvgGrid>
        );
    }
}

SvgGridExample.propTypes = {
    theme: React.PropTypes.object
};

export default SvgGridExample;
