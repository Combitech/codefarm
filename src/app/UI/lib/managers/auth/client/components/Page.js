import React from "react";
import LightComponent from "ui-lib/light_component";
import SignInOutForm from "./SignInOutForm";

class Page extends LightComponent {
    render() {
        this.log("render", this.props);

        return (
            <div className={this.props.theme.content}>
                <SignInOutForm theme={this.props.theme} />
            </div>
        );
    }
}

Page.propTypes = {
    theme: React.PropTypes.object
};

export default Page;
