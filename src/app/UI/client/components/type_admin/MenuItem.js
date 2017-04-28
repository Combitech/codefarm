
import React from "react";
import PropTypes from "prop-types";
import { MenuItem } from "react-toolbox/lib/menu";

class MyMenuItem extends React.PureComponent {
    render() {
        let onClick = this.props.onClick;

        if (this.props.pathname) {
            onClick = () => {
                this.context.router.push({
                    pathname: this.props.pathname
                });
            };
        }

        return (
            <MenuItem
                className={this.props.className}
                caption={this.props.caption}
                icon={this.props.icon}
                shortcut={this.props.shortcut}
                disabled={this.props.disabled}
                selected={this.props.selected}
                onClick={onClick}
            />
        );
    }
}

MyMenuItem.propTypes = {
    className: PropTypes.string,
    pathname: PropTypes.string,
    onClick: PropTypes.func,
    caption: PropTypes.string.isRequired,
    icon: PropTypes.any,
    shortcut: PropTypes.string,
    disabled: PropTypes.bool,
    selected: PropTypes.bool
};

MyMenuItem.contextTypes = {
    router: PropTypes.object.isRequired
};

export default MyMenuItem;
