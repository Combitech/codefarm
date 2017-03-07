import React from "react";
import LightComponent from "ui-lib/light_component";
import Snackbar from "react-toolbox/lib/snackbar";
import { Card, CardTitle, CardText, CardActions } from "react-toolbox/lib/card";
import { Input } from "react-toolbox/lib/input";
import { Button } from "react-toolbox/lib/button";
import { Row, Col } from "react-flexbox-grid";
import { setCookie } from "ui-lib/cookie";
import api from "api.io/api.io-client";

class Page extends LightComponent {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            statusMessage: { msg: "", type: "accept" }
        };
    }

    _showMessage(msg, type = "accept") {
        this.setState({ statusMessage: { msg: msg, type: type } });
    }

    _closeSnackbar() {
        this._showMessage("");
    }

    async _login() {
        const response = await api.auth.login(this.state.email, this.state.password);
        this.log("Login response", response);
        if (response.success) {
            this._showMessage(`Welcome ${response.username}!`);

            // Set cookie
            if (response.setCookies) {
                for (const cookie of response.setCookies) {
                    setCookie(cookie.name, cookie.value, cookie.opts);
                }
            }
        } else {
            const msg = response.message ? `Login failed: ${response.message}` : "Login failed";
            this._showMessage(msg, "warning");
        }
    }

    render() {
        this.log("render", this.props);

        return (
            <div>
                <div className={this.props.theme.content}>
                    <Row>
                        <Col xs={12} mdOffset={3} md={6} lgOffset={4} lg={4}>
                            <Card>
                                <CardTitle title="Codefarm Login"/>
                                <CardText>
                                    <Input
                                        type="email"
                                        label="Email"
                                        required={true}
                                        value={this.state.email}
                                        onChange={(email) => this.setState({ email })}
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
                                        label="Login"
                                        onClick={() => this._login()}
                                    />
                                </CardActions>
                            </Card>
                        </Col>
                    </Row>
                </div>
                <Snackbar
                    action="Dismiss"
                    active={this.state.statusMessage.msg.length > 0}
                    label={this.state.statusMessage.msg}
                    timeout={5000}
                    onClick={this._closeSnackbar.bind(this)}
                    onTimeout={this._closeSnackbar.bind(this)}
                    type={this.state.statusMessage.type}
                />
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
