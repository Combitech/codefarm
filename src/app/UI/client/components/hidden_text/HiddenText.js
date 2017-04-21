
import React from "react";
import PropTypes from "prop-types";

class HiddenText extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            show: false
        };
    }

    onClick(event) {
        event.stopPropagation();
        this.setState({ show: true });
    }

    render() {
        return (
            <span className={`${this.props.theme.container} ${this.props.className}`}>
                {!this.state.show && (
                    <a
                        onClick={(e) => this.onClick(e)}
                        className={this.props.theme.label}
                    >
                        {this.props.label}
                    </a>
                )}
                {this.state.show && (
                    <span>{this.props.text}</span>
                )}
            </span>
        );
    }
}

HiddenText.propTypes = {
    theme: PropTypes.object,
    className: PropTypes.string,
    text: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
};

export default HiddenText;
