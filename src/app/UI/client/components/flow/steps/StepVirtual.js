
import React from "react";
import PropTypes from "prop-types";

class StepVirtual extends React.Component {
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

StepVirtual.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired
};

export default StepVirtual;
