
import React from "react";
import PropTypes from "prop-types";
import { Button } from "react-toolbox/lib/button";

class ControlButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Button
                className={this.props.theme.button}
                label={this.props.label}
                onClick={() => {
                    if (this.props.pathname) {
                        this.context.router.push({
                            pathname: this.props.pathname
                        });
                    } else {
                        this.props.onClick();
                    }
                }}
                disabled={this.props.disabled}
            />
        );
    }
}

ControlButton.defaultProps = {
    disabled: false
};

ControlButton.propTypes = {
    theme: PropTypes.object,
    pathname: PropTypes.string,
    onClick: PropTypes.func,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool
};

ControlButton.contextTypes = {
    router: PropTypes.object.isRequired
};

export default ControlButton;
