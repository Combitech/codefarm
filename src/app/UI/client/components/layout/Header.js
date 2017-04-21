
import React from "react";
import PropTypes from "prop-types";

class Header extends React.PureComponent {
    render() {
        return (
            <div className={`${this.props.theme.header} ${this.props.className}`}>
                {this.props.label}
                {this.props.children}
            </div>
        );
    }
}

Header.defaultProps = {
    className: ""
};

Header.propTypes = {
    theme: PropTypes.object,
    children: PropTypes.node,
    className: PropTypes.string,
    label: PropTypes.string.isRequired
};

export default Header;
