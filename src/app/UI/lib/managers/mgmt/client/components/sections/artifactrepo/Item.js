
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import {
    Section as TASection
} from "ui-components/type_admin";

class Item extends LightComponent {
    render() {
        console.log("ItemLocal-RENDER", this.props);

        return (
            <TASection
                controls={this.props.controls}
                breadcrumbs={this.props.breadcrumbs}
                menuItems={this.props.menuItems}
            >
                <pre>
                    {JSON.stringify(this.props.item, null, 2)}
                </pre>
            </TASection>
        );
    }
}

Item.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    pathname: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    menuItems: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired
};

export default Item;
