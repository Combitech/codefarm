
import React from "react";
import PropTypes from "prop-types";
import api from "api.io/api.io-client";
import LightComponent from "ui-lib/light_component";
import {
    Section as TASection,
    MenuItem
} from "ui-components/type_admin";
import { BaselineSpecificationView } from "ui-components/data_view";

class Item extends LightComponent {
    async onForceRequest() {
        const response = await api.rest.action(
            "baselinegen.specification",
            this.props.item._id,
            "request"
        );

        console.log("onForceRequest: ", response);
    }

    render() {
        this.log("render", this.props, this.state);

        const menuItems = this.props.menuItems.slice(0);

        menuItems.push((
            <MenuItem
                key="force"
                caption="Force request"
                onClick={() => this.onForceRequest()}
            />
        ));

        return (
            <TASection
                controls={this.props.controls}
                breadcrumbs={this.props.breadcrumbs}
                menuItems={menuItems}
            >
                <div className={this.props.theme.container}>
                    <BaselineSpecificationView
                        item={this.props.item}
                    />
                </div>
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
