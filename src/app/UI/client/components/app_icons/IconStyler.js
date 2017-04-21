import React from "react";
import PropTypes from "prop-types";

class IconStyler extends React.Component {
    render() {
        const style = {};
        if (this.props.white) {
            style.fill = "white";
        } else if (this.props.color) {
            style.fill = this.props.color;
        }

        return (
            <div style={style}>
                {this.props.children}
            </div>
        );
    }
}

IconStyler.propTypes = {
    white: PropTypes.bool,
    color: PropTypes.string,
    children: PropTypes.element.isRequired
};

export default IconStyler;
