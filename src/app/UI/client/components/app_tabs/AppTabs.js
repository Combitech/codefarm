
import React from "react";
import PropTypes from "prop-types";
import { Tabs } from "react-toolbox/lib/tabs";
import LightComponent from "ui-lib/light_component";

class AppTabs extends LightComponent {
    onChange(index) {
        const value = this.props.children[index].props.value;
        this.props.selected.set(value);
    }

    render() {
        const index = Math.max(this.props.children.findIndex((child) => child.props.value === this.props.selected.value), 0);

        return (
            <Tabs
                theme={this.props.theme}
                className={this.props.theme.appTabs}
                onChange={this.onChange.bind(this)}
                index={index}
                fixed={true}
            >
                {this.props.children}
            </Tabs>
        );
    }
}

AppTabs.propTypes = {
    children: PropTypes.node,
    theme: PropTypes.object,
    selected: PropTypes.object.isRequired
};

export default AppTabs;
