
import React from "react";
import PropTypes from "prop-types";
import { Col as ColItem } from "react-flexbox-grid";

class Column extends React.PureComponent {
    render() {
        const props = Object.assign({}, this.props, {
            className: `${this.props.theme.column} ${this.props.className}`
        });

        delete props.theme;

        return (
            <ColItem {...props} />
        );
    }
}

Column.defaultProps = {
    className: ""
};

Column.propTypes = {
    theme: PropTypes.object,
    children: PropTypes.node,
    className: PropTypes.string
};

export default Column;
