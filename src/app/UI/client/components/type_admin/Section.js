
import React from "react";
import Breadcrumbs from "ui-components/breadcrumbs";
import LightComponent from "ui-lib/light_component";

class Section extends LightComponent {
    render() {
        this.log("render", this.props);

        return (
            <div className={this.props.theme.section}>
                <div className={this.props.theme.header}>
                    {this.props.controls}
                    <Breadcrumbs
                        theme={this.props.theme}
                        items={this.props.breadcrumbs}
                    />
                </div>
                <div>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

Section.propTypes = {
    theme: React.PropTypes.object,
    children: React.PropTypes.node,
    controls: React.PropTypes.node,
    breadcrumbs: React.PropTypes.array
};

export default Section;
