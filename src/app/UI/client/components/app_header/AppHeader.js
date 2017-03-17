
import React from "react";
import FontIcon from "react-toolbox/lib/font_icon";
import { ThemeProvider } from "react-css-themr";

class AppHeader extends React.Component {
    constructor(props) {
        super(props);

        this.contextTheme = {
            RTInput: require("./theme.scss"),
            RTDropdown: require("./theme.scss")
        };
    }

    render() {
        let children;

        if (this.props.children) {
            children = this.props.children instanceof Array ? this.props.children : [ this.props.children ];
            children = children.map((child) => (
                <ThemeProvider
                    key={child.key}
                    theme={this.contextTheme}
                >
                    {child}
                </ThemeProvider>
            ));
        }

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
                {children}
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
