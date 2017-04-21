
import React from "react";
import PropTypes from "prop-types";

class Container extends React.PureComponent {
    render() {
        return (
            <div className={`${this.props.theme.container} ${this.props.className}`}>
                {this.props.children}
            </div>
        );
    }
}

Container.defaultProps = {
    className: ""
};

Container.propTypes = {
    theme: PropTypes.object,
    children: PropTypes.node,
    className: PropTypes.string
};

export default Container;
