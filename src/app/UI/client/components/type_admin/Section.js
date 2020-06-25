
import React from "react";
import PropTypes from "prop-types";
import { Breadcrumbs } from "ui-components/breadcrumbs";
import LightComponent from "ui-lib/light_component";
import { IconMenu } from "react-toolbox/lib/menu";

class Section extends LightComponent {
    render() {
        this.log("render", this.props);

        return (
            <div className={this.props.theme.section}>
                <If condition={this.props.breadcrumbs || this.props.controls || this.props.menuItems}>
                    <div className={this.props.theme.header}>
                        <If condition={this.props.menuitems && this.props.menuItems.length > 0}>
                            <IconMenu
                                className={this.props.theme.button}
                                icon="more_vert"
                                menuRipple={true}
                            >
                                {this.props.menuItems}
                            </IconMenu>
                        </If>
                        {this.props.controls}
                        <Breadcrumbs
                            theme={this.props.theme}
                            items={this.props.breadcrumbs}
                        />
                    </div>
                </If>
                {this.props.children}
            </div>
        );
    }
}

Section.propTypes = {
    theme: PropTypes.object,
    children: PropTypes.node,
    controls: PropTypes.node,
    menuItems: PropTypes.node,
    breadcrumbs: PropTypes.array
};

export default Section;
