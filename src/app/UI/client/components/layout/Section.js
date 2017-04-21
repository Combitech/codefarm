
import React from "react";
import PropTypes from "prop-types";

class Section extends React.PureComponent {
    render() {
        return (
            <div className={`${this.props.theme.section} ${this.props.className}`}>
                {this.props.children}
            </div>
        );
    }
}

Section.defaultProps = {
    className: ""
};

Section.propTypes = {
    theme: PropTypes.object,
    children: PropTypes.node,
    className: PropTypes.string
};

export default Section;
