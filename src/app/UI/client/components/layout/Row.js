
import React from "react";
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
    theme: React.PropTypes.object,
    children: React.PropTypes.node,
    className: React.PropTypes.string
};

export default Row;
