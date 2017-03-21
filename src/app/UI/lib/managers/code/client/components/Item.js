
import React from "react";
import LightComponent from "ui-lib/light_component";
import Follow from "./Follow";
import {
    Section as TASection
} from "ui-components/type_admin";

class Item extends LightComponent {
    render() {
        this.log("render", this.props, this.state);

        return (
            <TASection
                controls={this.props.controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <Follow
                    theme={this.props.theme}
                    item={this.props.item}
                    pathname={this.props.pathname}
                />
            </TASection>
        );
    }
}

Item.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

export default Item;
