
import React from "react";

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
    theme: React.PropTypes.object,
    children: React.PropTypes.node,
    className: React.PropTypes.string
};

export default Container;
