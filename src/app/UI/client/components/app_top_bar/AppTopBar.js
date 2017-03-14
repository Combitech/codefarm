
import React from "react";
import AppBar from "react-toolbox/lib/app_bar";
import { Button, IconButton } from "react-toolbox/lib/button";
import Switch from "react-toolbox/lib/switch";
import { Menu, MenuItem } from "react-toolbox/lib/menu";
import LightComponent from "ui-lib/light_component";
import { CodeFarmIcon } from "ui-components/app_icons";
import ActiveUser from "ui-observables/active_user";
import UserAvatar from "ui-components/user_avatar";

class AppTopBar extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            activeUser: ActiveUser.instance.user.getValue(),
            userMenuOpen: false,
            loginEnabled: true
        };
    }

    componentDidMount() {
        this.addDisposable(ActiveUser.instance.user.subscribe((activeUser) => this.setState({ activeUser })));
    }

    onClick(pathname) {
        this.context.router.push({ pathname });
    }

    _toggleUserMenu() {
        this.setState((prevState) => ({
            userMenuOpen: !prevState.userMenuOpen
        }));
    }

    _hideUserMenu() {
        this.setState({
            userMenuOpen: false
        });
    }

    render() {
        let activeUser = this.state.activeUser.toJS();
        if (!this.state.loginEnabled) {
            activeUser = {
                userLoggedIn: true,
                username: "Unkown user"
            };
        }

        let rightMenu;
        if (activeUser.userLoggedIn) {
            rightMenu = (
                <div className={this.props.theme.iconMenu}>
                    <Button
                        className={this.props.theme.topRightButton}
                        onClick={() => this._toggleUserMenu()}
                        flat={true}
                        label={activeUser.username}
                        icon={
                            <UserAvatar
                                className={this.props.theme.userAvatar}
                                userId={activeUser.id}
                            />
                        }
                    />
                    <Menu
                        active={this.state.userMenuOpen}
                        position="auto"
                        onHide={() => this._hideUserMenu()}
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
                        {activeUser.id &&
                            <MenuItem
                                value={`/collaborators/users/${activeUser.id}`}
                                caption="Profile"
                            />
                        }
                        <MenuItem
                            value="/help"
                            caption="Help"
                        />
                        <MenuItem
                            value="/signout"
                            caption="Sign out"
                        />
                    </Menu>
                </div>
            );
        } else {
            rightMenu = (
                <Button
                    label="Sign in"
                    className={this.props.theme.topRightButton}
                    flat={true}
                    onMouseUp={this.onClick.bind(this, "/signin")}
                />
            );
        }

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
                {activeUser.userLoggedIn &&
                    <div>
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
                    </div>
                }
                <Switch
                    className={this.props.theme.topRightButton}
                    label="Sign in enabled"
                    checked={this.state.loginEnabled}
                    onChange={(loginEnabled) => this.setState({ loginEnabled })}
                />
                {rightMenu}
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
