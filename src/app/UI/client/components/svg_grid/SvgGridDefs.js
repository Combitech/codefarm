
import React from "react";

class SvgGridDefs extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return this.props.children;
    }
}

SvgGridDefs.propTypes = {
    children: React.PropTypes.node.isRequired
};

export default SvgGridDefs;
