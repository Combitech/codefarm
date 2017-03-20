
import React from "react";

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
    theme: React.PropTypes.object,
    children: React.PropTypes.node,
    className: React.PropTypes.string
};

export default Section;
