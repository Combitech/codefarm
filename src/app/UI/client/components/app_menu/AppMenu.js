
import React from "react";
import { Button } from "react-toolbox/lib/button";

class AppMenu extends React.Component {
    constructor(props) {
        super(props);

        this.checkActive(props);
    }

    componentWillReceiveProps(nextProps) {
        this.checkActive(nextProps);
    }

    checkActive(props) {
        if (props.items.length === 0 || props.items.some((item) => item.active)) {
            return;
        }

        this.context.router.push({ pathname: props.items[0].pathname });
    }

    render() {
        return (
            <div className={this.props.theme.appMenu}>
                <div className={this.props.theme.header}>
                    <img
                        className={this.props.theme.headerImage}
                        src={this.props.icon}
                    />
                    <div className={this.props.theme.headerText}>
                        {this.props.primaryText}
                    </div>
                </div>

                {this.props.items.map((item) => {
                    let className = this.props.theme.menuItem;

                    if (item.active) {
                        className = this.props.theme.menuItemActive;
                    }

                    return (
                        <Button
                            key={item.pathname}
                            theme={this.props.theme}
                            icon={item.icon}
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
