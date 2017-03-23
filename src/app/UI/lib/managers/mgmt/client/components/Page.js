import React from "react";
import { AppMenu } from "ui-components/app_menu";
import LightComponent from "ui-lib/light_component";

class Page extends LightComponent {
    render() {
        this.log("render", this.props);

        const pathname = this.getPathname();

        const items = this.props.route.childRoutes.map((route) => {
            const pn = `${pathname}/${route.path}`;
            const active = this.context.router.location.pathname.startsWith(pn);

            return {
                label: route.label,
                pathname: pn,
                active: active,
                icon: route.icon
            };
        });

        return (
            <div>
                <AppMenu
                    primaryText="Management"
                    icon="/Cheser/256x256/apps/utilities-system-monitor.png"
                    items={items}
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
