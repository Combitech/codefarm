
import React from "react";
import PropTypes from "prop-types";
import { Breadcrumbs } from "ui-components/breadcrumbs";
import LightComponent from "ui-lib/light_component";

class Section extends LightComponent {
    render() {
        this.log("render", this.props);

        return (
            <div className={this.props.theme.section}>
                <If condition={this.props.breadcrumbs || this.props.controls}>
                    <div className={this.props.theme.header}>
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
    breadcrumbs: PropTypes.array
};

export default Section;
