
import React from "react";
import FontIcon from "react-toolbox/lib/font_icon";

class AppHeader extends React.PureComponent {
    render() {
        return (
            <div className={this.props.theme.appHeader}>
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
    children: React.PropTypes.node,
    primaryText: React.PropTypes.string.isRequired,
    secondaryText: React.PropTypes.string.isRequired,
    icon: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.element
    ]),
    theme: React.PropTypes.object
};

export default AppHeader;
