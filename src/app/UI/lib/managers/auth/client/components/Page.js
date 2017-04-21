import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import SignInForm from "./SignInForm";
import SignOutForm from "./SignOutForm";
import ActiveUser from "ui-observables/active_user";

class Page extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            activeUser: ActiveUser.instance.user.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(ActiveUser.instance.user.subscribe((activeUser) => this.setState({ activeUser })));
    }

    render() {
        this.log("render", this.props);

        const userLoggedIn = this.state.activeUser.get("userLoggedIn");
        const isGuestUser = this.state.activeUser.get("isGuestUser");

        return (
            <div className={this.props.theme.content}>
                <Choose>
                    <When condition={ userLoggedIn && !isGuestUser }>
                        <SignOutForm
                            theme={this.props.theme}
                            userId={this.state.activeUser.get("_id")}
                            userName={this.state.activeUser.get("username")}
                        />
                    </When>
                    <Otherwise>
                        <SignInForm theme={this.props.theme} />
                    </Otherwise>
                </Choose>
            </div>
        );
    }
}

Page.propTypes = {
    theme: PropTypes.object
};

export default Page;
