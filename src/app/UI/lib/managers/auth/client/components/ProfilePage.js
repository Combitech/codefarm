import React from "react";
import LightComponent from "ui-lib/light_component";
import ActiveUser from "ui-observables/active_user";
import theme from "./theme.scss";

class ProfilePage extends LightComponent {
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

        const activeUser = this.state.activeUser.toJS();

        return (
            <div className={this.props.theme.content}>
                <pre>
                    {JSON.stringify(activeUser, null, 2)}
                </pre>
            </div>
        );
    }
}

// TODO: Remove when moved out of auth manager...
ProfilePage.defaultProps = {
    theme
};

ProfilePage.propTypes = {
    theme: React.PropTypes.object
};

export default ProfilePage;
