
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import statusIcons from "ui-lib/status_icons";

class StatusIcon extends LightComponent {
    constructor(props) {
        super(props);
    }

    render() {
        this.log("render", this.props, JSON.stringify(this.state, null, 2));

        const statusIcon = statusIcons[this.props.status];
        const style = {
            width: this.props.size,
            height: this.props.size
        };

        return (
            <div
                className={`${this.props.theme.statusIcon} ${this.props.className || ""}`}
                style={style}
            >
                {statusIcon.map((icon, index) => {
                    const statusClassName = `${this.props.status}-${index}`;

                    return (
                        <div
                            key={icon}
                            className={`${this.props.theme.layer} ${this.props.theme[this.props.status]} ${this.props.theme[statusClassName]}`}
                            style={style}
                        >
                            <img
                                style={style}
                                src={icon}
                            />
                        </div>
                    );
                })}
            </div>
        );
    }
}

StatusIcon.propTypes = {
    theme: PropTypes.object,
    className: PropTypes.string,
    status: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired
};

export default StatusIcon;
