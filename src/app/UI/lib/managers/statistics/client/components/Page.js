
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { AppMenu } from "ui-components/app_menu";

class Page extends LightComponent {
    render() {
        this.log("render", this.props, this.state);

        return (
            <div>
                <AppMenu
                    primaryText="Statistics"
                    icon="/Cheser/256x256/mimetypes/x-office-spreadsheet.png"
                    items={[]}
                />
                <div className={this.props.theme.content}>
                    {this.props.children && React.cloneElement(this.props.children, { theme: this.props.theme })}
                </div>
            </div>
        );
    }
}

Page.propTypes = {
    theme: PropTypes.object,
    children: PropTypes.node,
    route: PropTypes.object.isRequired
};

Page.contextTypes = {
    router: PropTypes.object.isRequired
};

export default Page;
