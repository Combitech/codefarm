
import React from "react";
import api from "api.io/api.io-client";
import LightComponent from "ui-lib/light_component";
import {
    Section as TASection,
    ControlButton as TAControlButton
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

        const controls = this.props.controls.slice(0);

        controls.push((
            <TAControlButton
                key="force"
                label="Force request"
                onClick={() => this.onForceRequest()}
            />
        ));

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
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
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

export default Item;
