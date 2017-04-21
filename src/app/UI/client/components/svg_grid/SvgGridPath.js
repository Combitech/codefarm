
import React from "react";
import PropTypes from "prop-types";

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
    fromKey: PropTypes.string.isRequired,
    toKey: PropTypes.string.isRequired,
    markerStart: PropTypes.string,
    markerEnd: PropTypes.string,
    markerMid: PropTypes.string,
    toMargin: PropTypes.number,
    fromMargin: PropTypes.number,
    toDir: isValidDirection,
    fromDir: isValidDirection
};

export default SvgGridPath;
