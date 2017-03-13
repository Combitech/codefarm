import React from "react";
import LightComponent from "ui-lib/light_component";
import { Card, CardTitle, CardText, CardActions } from "react-toolbox/lib/card";
import { Input } from "react-toolbox/lib/input";
import { Button } from "react-toolbox/lib/button";
import { Row, Col } from "react-flexbox-grid";
import { signin, signout } from "ui-lib/auth";
import ActiveUser from "ui-observables/active_user";

class Page extends LightComponent {
    constructor(props) {
        super(props);
        this.state = {
            activeUser: ActiveUser.instance.user.getValue(),
            emailOrId: "",
            password: ""
        };
    }

    componentDidMount() {
        this.addDisposable(ActiveUser.instance.user.subscribe((activeUser) => this.setState({ activeUser })));
    }

    async _login() {
        const response = await signin(this.state.emailOrId, this.state.password);
        this.log("Sign in response", response);
        if (response.success) {
            this.context.router.push({
                pathname: "/"
            });
        }
    }

    async _logout() {
        const response = await signout();
        this.log("Sign out response", response);
        if (response.success) {
            this.context.router.push({
                pathname: "/signin"
            });
        }
    }

    render() {
        this.log("render", this.props);

        return (
            <div className={this.props.theme.content}>
                <Row>
                    <Col xs={12} mdOffset={3} md={6} lgOffset={4} lg={4}>
                        <Card>
                            {this.state.activeUser.get("userLoggedIn") ? (
                                <div>
                                    <CardTitle title="CodeFarm Sign Out"/>
                                    <CardText>
                                        User {this.state.activeUser.get("username")} currently signed in.
                                    </CardText>
                                    <CardActions>
                                        <Button
                                            label="Sign out"
                                            onClick={() => this._logout()}
                                        />
                                    </CardActions>
                                </div>
                            ) : (
                                <div>
                                    <CardTitle title="CodeFarm Sign In"/>
                                    <CardText>
                                        <Input
                                            type="text"
                                            label="User id or email"
                                            required={true}
                                            value={this.state.emailOrId}
                                            onChange={(emailOrId) => this.setState({ emailOrId })}
                                        />
                                        <Input
                                            type="password"
                                            label="Password"
                                            required={true}
                                            value={this.state.password}
                                            onChange={(password) => this.setState({ password })}
                                        />
                                    </CardText>
                                    <CardActions>
                                        <Button
                                            label="Sign in"
                                            onClick={() => this._login()}
                                        />
                                    </CardActions>
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

Page.propTypes = {
    theme: React.PropTypes.object,
    children: React.PropTypes.node,
    route: React.PropTypes.object.isRequired
};

Page.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default Page;
