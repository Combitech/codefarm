import React from "react";

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
    white: React.PropTypes.bool,
    color: React.PropTypes.string,
    children: React.PropTypes.element.isRequired
};

export default IconStyler;
