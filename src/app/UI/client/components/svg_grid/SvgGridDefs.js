
import React from "react";
import PropTypes from "prop-types";

class SvgGridDefs extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return this.props.children;
    }
}

SvgGridDefs.propTypes = {
    children: PropTypes.node.isRequired
};

export default SvgGridDefs;
