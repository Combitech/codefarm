
import React from "react";

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
    theme: React.PropTypes.object,
    children: React.PropTypes.node,
    className: React.PropTypes.string,
    label: React.PropTypes.string.isRequired
};

export default Header;
