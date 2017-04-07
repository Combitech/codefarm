
import React from "react";
import { SvgGridExample } from "ui-components/svg_grid";
import { AppHeader } from "ui-components/app_header";
import LightComponent from "ui-lib/light_component";

class Page extends LightComponent {
    render() {
        return (
            <div>
                <AppHeader
                    primaryText="Playground"
                    secondaryText="The place where anything can happen"
                    icon="child_friendly"
                />
                <SvgGridExample />
            </div>
        );
    }
}

Page.propTypes = {
};

export default Page;
