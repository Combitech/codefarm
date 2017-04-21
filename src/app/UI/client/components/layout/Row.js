
import React from "react";
import PropTypes from "prop-types";
import { Row as RowItem } from "react-flexbox-grid";

class Row extends React.PureComponent {
    render() {
        const props = Object.assign({}, this.props, {
            className: `${this.props.theme.row} ${this.props.className}`
        });

        delete props.theme;

        return (
            <RowItem {...props} />
        );
    }
}

Row.defaultProps = {
    className: ""
};

Row.propTypes = {
    theme: PropTypes.object,
    children: PropTypes.node,
    className: PropTypes.string
};

export default Row;
