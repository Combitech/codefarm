
import React from "react";

class SvgGridArrowMarkerDef extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const color = this.props.color || "black";
        const markerWidth = this.props.width || 10;
        const markerHeight = this.props.height || 10;
        const isStart = this.props.isStart || false;

        const transform = isStart ? "rotate(180 5 0)" : "";
        const refX = isStart ? markerWidth : 0;

        return (
            <marker
                id={this.props.id}
                viewBox="0 -5 10 10"
                preserveAspectRatio="none"
                markerUnits="userSpaceOnUse"
                markerWidth={markerWidth}
                markerHeight={markerHeight}
                refX={refX}
                refY="0"
                orient="auto"
            >
               <path d="M0,-5 L10,0 L0,5 z" style={{ fill: color }} transform={transform} />
            </marker>
        );
    }
}

SvgGridArrowMarkerDef.propTypes = {
    id: React.PropTypes.string.isRequired,
    color: React.PropTypes.string,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    isStart: React.PropTypes.bool
};

export default SvgGridArrowMarkerDef;
