
import React from "react";

class SvgGridPath extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return ("");
    }
}

const isValidDirection = (props, propName, componentName) => {
    const allowedDirs = [ "vertical", "horizontal" ];
    if (props[propName] && allowedDirs.indexOf(props[propName].toLowerCase()) === -1) {
        return new Error(
            `Invalid prop \"${propName}\" supplied to ` +
            `\"${componentName}\". Allowed directions ${allowedDirs.join(", ")}`
        );
    }
};

SvgGridPath.defaultProps = {
    toDir: "vertical",
    fromDir: "vertical"
};

SvgGridPath.propTypes = {
    fromKey: React.PropTypes.string.isRequired,
    toKey: React.PropTypes.string.isRequired,
    markerStart: React.PropTypes.string,
    markerEnd: React.PropTypes.string,
    markerMid: React.PropTypes.string,
    toMargin: React.PropTypes.number,
    fromMargin: React.PropTypes.number,
    toDir: isValidDirection,
    fromDir: isValidDirection
};

export default SvgGridPath;
