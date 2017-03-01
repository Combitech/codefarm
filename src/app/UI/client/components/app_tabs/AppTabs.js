
import React from "react";
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
    children: React.PropTypes.node,
    theme: React.PropTypes.object,
    selected: React.PropTypes.object.isRequired
};

export default AppTabs;
