
import React from "react";
import PropTypes from "prop-types";
import filters from "../filters";

class Shadow extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <filter id={this.props.id} height="130%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                <feOffset dx="0" dy="1" result="offsetblur" />
                <feComponentTransfer>
                    <feFuncA type="linear" slope="0.4" />
                </feComponentTransfer>
                <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        );
    }
}

Shadow.defaultProps = {
    id: filters.SHADOW
};

Shadow.propTypes = {
    id: PropTypes.string
};

export default Shadow;
