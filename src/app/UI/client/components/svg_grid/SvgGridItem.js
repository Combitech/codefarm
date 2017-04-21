
import React from "react";
import PropTypes from "prop-types";

class SvgGridItem extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <g onClick={this.props.onClick}>
                {this.props.children}
            </g>
        );
    }
}

SvgGridItem.propTypes = {
    children: PropTypes.node,
    column: PropTypes.number.isRequired,
    row: PropTypes.number.isRequired,
    onClick: PropTypes.func
};

export default SvgGridItem;
