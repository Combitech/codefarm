
import React from "react";
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
    theme: React.PropTypes.object,
    children: React.PropTypes.node,
    route: React.PropTypes.object.isRequired
};

Page.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default Page;
