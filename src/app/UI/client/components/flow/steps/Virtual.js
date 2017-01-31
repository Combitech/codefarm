
import React from "react";

class Virtual extends React.Component {
    render() {
        return (
            <g
                className={this.props.theme.virtualBox}
            >
                <line
                    className={this.props.theme.path}
                    x1="14"
                    y1="25"
                    x2="386"
                    y2="25"
                />
            </g>
        );
    }
}

Virtual.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired
};

export default Virtual;
