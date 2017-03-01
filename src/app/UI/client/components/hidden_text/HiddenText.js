
import React from "react";

class HiddenText extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            show: false
        };
    }

    render() {
        return (
            <span className={`${this.props.theme.container} ${this.props.className}`}>
                {!this.state.show && (
                    <a
                        onClick={() => this.setState({ show: true })}
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
    theme: React.PropTypes.object,
    className: React.PropTypes.string,
    text: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired
};

export default HiddenText;
