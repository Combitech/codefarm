
import React from "react";
import AppBar from "react-toolbox/lib/app_bar";
import { Button, IconButton } from "react-toolbox/lib/button";
import { IconMenu, MenuItem } from "react-toolbox/lib/menu";
import LightComponent from "ui-lib/light_component";
import { CodeFarmIcon } from "ui-components/app_icons";


class AppTopBar extends LightComponent {
    onClick(pathname) {
        this.context.router.push({ pathname });
    }

    render() {
        return (
            <AppBar
                className={this.props.theme.topBar}
                fixed={true}
            >
                <IconButton
                    className={this.props.theme.iconButton}
                    icon={(<CodeFarmIcon width={24} height={24} />)}
                    onMouseUp={this.onClick.bind(this, "/")}
                />
                <Button
                    label="Code Revisions"
                    flat={true}
                    onMouseUp={this.onClick.bind(this, "/code")}
                />
                <Button
                    label="Artifacts"
                    flat={true}
                    onMouseUp={this.onClick.bind(this, "/artifacts")}
                />
                <Button
                    label="Collaborators"
                    flat={true}
                    onMouseUp={this.onClick.bind(this, "/collaborators")}
                />
                {this.props.children}
                <IconMenu
                    className={this.props.theme.iconMenu}
                    onSelect={this.onClick.bind(this)}
                >
                    <MenuItem
                        value="/admin"
                        caption="Administration"
                    />
                    <MenuItem
                        value="/management"
                        caption="Management"
                    />
                    <MenuItem
                        value="/feedback"
                        caption="Send feedback"
                    />
                    <MenuItem
                        value="/profile"
                        caption="Profile"
                    />
                    <MenuItem
                        value="/help"
                        caption="Help"
                    />
                    <MenuItem
                        value="/signout"
                        caption="Sign out"
                    />
                </IconMenu>
            </AppBar>
        );
    }
}

AppTopBar.propTypes = {
    children: React.PropTypes.node,
    theme: React.PropTypes.object
};

AppTopBar.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default AppTopBar;
