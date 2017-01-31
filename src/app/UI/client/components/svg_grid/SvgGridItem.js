
import React from "react";

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
    children: React.PropTypes.node,
    column: React.PropTypes.number.isRequired,
    row: React.PropTypes.number.isRequired,
    onClick: React.PropTypes.func
};

export default SvgGridItem;
