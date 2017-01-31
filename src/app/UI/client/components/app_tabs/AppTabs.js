
import React from "react";
import { Tabs } from "react-toolbox/lib/tabs";
import Component from "ui-lib/component";

class AppTabs extends Component {
    constructor(props) {
        super(props);
    }

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
