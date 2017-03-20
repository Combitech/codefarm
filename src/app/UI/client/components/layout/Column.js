
import React from "react";
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
    theme: React.PropTypes.object,
    children: React.PropTypes.node,
    className: React.PropTypes.string
};

export default Column;
