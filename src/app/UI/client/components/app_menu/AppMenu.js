
import React from "react";
import FontIcon from "react-toolbox/lib/font_icon";
import { Button } from "react-toolbox/lib/button";

class AppMenu extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={this.props.theme.appMenu}>
                <FontIcon
                    className={this.props.theme.appIcon}
                    value={this.props.icon}
                />
                <h1>{this.props.primaryText}</h1>

                {this.props.items.map((item) => {
                    let className = this.props.theme.menuItem;

                    if (item.active) {
                        className = this.props.theme.menuItemActive;
                    }

                    return (
                        <Button
                            key={item.pathname}
                            className={className}
                            label={item.label}
                            flat={true}
                            onMouseUp={() => {
                                this.context.router.push({ pathname: item.pathname });
                            }}
                        />
                    );
                })}
            </div>
        );
    }
}

AppMenu.propTypes = {
    primaryText: React.PropTypes.string.isRequired,
    items: React.PropTypes.array.isRequired,
    icon: React.PropTypes.string.isRequired,
    theme: React.PropTypes.object.isRequired
};

AppMenu.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default AppMenu;
