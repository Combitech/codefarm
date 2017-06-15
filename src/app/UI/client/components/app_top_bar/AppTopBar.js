
/* global window */

import React from "react";
import PropTypes from "prop-types";
import AppBar from "react-toolbox/lib/app_bar";
import { Button, IconButton } from "react-toolbox/lib/button";
import { Menu, MenuItem, MenuDivider } from "react-toolbox/lib/menu";
import FontIcon from "react-toolbox/lib/font_icon";
import LightComponent from "ui-lib/light_component";
import { CodeFarmIcon } from "ui-components/app_icons";
import ActiveUser from "ui-observables/active_user";
import { UserAvatar } from "ui-components/user_avatar";
import { signout } from "ui-lib/auth";

class AppTopBar extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            activeUser: ActiveUser.instance.user.getValue(),
            userMenuOpen: false
        };
    }

    componentDidMount() {
        this.addDisposable(ActiveUser.instance.user.subscribe((activeUser) => this.setState({ activeUser })));
    }

    onClick(pathname) {
        if (pathname.match(/^https?:/)) {
            window.open(pathname);
        } else {
            this.context.router.push({ pathname });
        }
    }

    signOut() {
        signout()
        .then((response) => {
            this.log("Sign out response", response);
        })
        .catch((error) => {
            this.log("Sign out failed", error);
            console.error("Sign out failed", error);
        });
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
        const activeUser = this.state.activeUser.toJS();

        const rightMenu = (
            <Choose>
                <When condition={ activeUser.userLoggedIn && !activeUser.isGuestUser }>
                    <div className={this.props.theme.iconMenu}>
                        <Button
                            className={this.props.theme.topRightButton}
                            onClick={() => this._toggleUserMenu()}
                            flat={true}
                            inverse={true}
                            icon={
                                <UserAvatar
                                    className={this.props.theme.userAvatar}
                                    userId={activeUser.id}
                                />
                            }
                        >
                            <span>
                                <span>{activeUser.username}</span>
                                <FontIcon
                                    style={{ verticalAlign: "middle" }}
                                    value="arrow_drop_down"
                                />
                            </span>
                        </Button>
                        <div className={this.props.theme.menuContainer}>
                            <Menu
                                active={this.state.userMenuOpen}
                                position="auto"
                                onHide={() => this._hideUserMenu()}
                                onSelect={this.onClick.bind(this)}
                            >
                                <If condition={ activeUser.id }>
                                    <MenuItem
                                        icon="person"
                                        value={`/collaborators/users/${activeUser.id}`}
                                        caption="Profile"
                                    />
                                </If>
                                <MenuItem
                                    icon="feedback"
                                    value="https://github.com/Combitech/codefarm"
                                    caption="Feedback"
                                />
                                <MenuItem
                                    icon="help"
                                    value="/help"
                                    caption="Help"
                                />

                                <MenuDivider />

                                <MenuItem
                                    icon="build"
                                    value="/admin"
                                    caption="Administration"
                                />
                                <MenuItem
                                    icon="track_changes"
                                    value="/management"
                                    caption="Management"
                                />
                                <MenuItem
                                    icon="sms"
                                    value="/notifications"
                                    caption="Notifications"
                                />

                                <MenuDivider />

                                <MenuItem
                                    icon="exit_to_app"
                                    caption="Sign out"
                                    onClick={() => this.signOut()}
                                />
                            </Menu>
                        </div>
                    </div>
                </When>
                <Otherwise>
                    <Button
                        label="Sign in"
                        className={this.props.theme.topRightButton}
                        flat={true}
                        inverse={true}
                        onMouseUp={this.onClick.bind(this, "/signin")}
                    />
                </Otherwise>
            </Choose>
        );

        return (
            <AppBar
                className={this.props.theme.topBar}
                fixed={true}
            >
                <IconButton
                    inverse={true}
                    className={this.props.theme.iconButton}
                    icon={(<CodeFarmIcon width={24} height={24} />)}
                    onMouseUp={this.onClick.bind(this, "/")}
                />
                {activeUser.userLoggedIn &&
                    <div>
                        <Button
                            label="Code Revisions"
                            flat={true}
                            inverse={true}
                            onMouseUp={this.onClick.bind(this, "/code")}
                        />
                        <Button
                            label="Artifacts"
                            flat={true}
                            inverse={true}
                            onMouseUp={this.onClick.bind(this, "/artifacts")}
                        />
                        <Button
                            label="Baselines"
                            flat={true}
                            inverse={true}
                            onMouseUp={this.onClick.bind(this, "/baselines")}
                        />
                        <Button
                            label="Collaborators"
                            flat={true}
                            inverse={true}
                            onMouseUp={this.onClick.bind(this, "/collaborators")}
                        />
                        <Button
                            label="Statistics"
                            flat={true}
                            inverse={true}
                            onMouseUp={this.onClick.bind(this, "/statistics")}
                        />
                        {this.props.children}
                    </div>
                }
                {rightMenu}
            </AppBar>
        );
    }
}

AppTopBar.propTypes = {
    children: PropTypes.node,
    theme: PropTypes.object
};

AppTopBar.contextTypes = {
    router: PropTypes.object.isRequired
};

export default AppTopBar;
