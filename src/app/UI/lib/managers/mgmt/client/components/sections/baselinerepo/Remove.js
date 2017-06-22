
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import {
    Form as TAForm,
    Section as TASection
} from "ui-components/type_admin";

class Remove extends LightComponent {
    render() {
        console.log("RemoveLocal-RENDER", this.props);

        return (
            <TASection
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
                menuItems={this.props.menuItems}
            >
                <TAForm
                    confirmText="Remove"
                    primaryText="Remove baseline repository backend"
                    secondaryText={`Area you sure you want to remove ${this.props.item._id}?`}
                    onConfirm={async () => {
                        await this.props.onRemove(this.props.item.type, this.props.item._id);
                    }}
                    onCancel={() => {
                        this.props.onCancel();
                    }}
                />
            </TASection>
        );
    }
}

Remove.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    pathname: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    menuItems: PropTypes.array.isRequired,
    onRemove: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default Remove;
