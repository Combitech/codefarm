
import React from "react";
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
    theme: React.PropTypes.object,
    pathname: React.PropTypes.string,
    onClick: React.PropTypes.func,
    label: React.PropTypes.string.isRequired,
    disabled: React.PropTypes.bool
};

ControlButton.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default ControlButton;
