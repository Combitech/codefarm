
import React from "react";
import PropTypes from "prop-types";
import FontIcon from "react-toolbox/lib/font_icon";

class AppHeader extends React.PureComponent {
    render() {
        return (
            <div className={`${this.props.theme.appHeader} ${this.props.className || ""}`}>
                <Choose>
                    <When condition={ typeof this.props.icon === "string" }>
                        <FontIcon
                            className={this.props.theme.appIcon}
                            value={this.props.icon}
                        />
                    </When>
                    <Otherwise>
                        <div className={this.props.theme.appIcon}>
                            {this.props.icon}
                        </div>
                    </Otherwise>
                </Choose>
                <h1>{this.props.primaryText}</h1>
                <h2>{this.props.secondaryText}</h2>
                {this.props.children}
            </div>
        );
    }
}

AppHeader.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    primaryText: PropTypes.string.isRequired,
    secondaryText: PropTypes.string.isRequired,
    icon: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element
    ]),
    theme: PropTypes.object
};

export default AppHeader;
