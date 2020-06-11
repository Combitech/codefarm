
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import TASection from "./Section";
import TAForm from "./Form";

class RemoveForm extends LightComponent {
    render() {
        this.log("render", this.props, this.state);
	
        let humanTypeName = this.props.route.humanTypeName;
        if (!humanTypeName) {
            humanTypeName = `instance of ${this.props.item.type}`;
        }

        return (
            <TASection
                theme={this.props.theme}
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
                menuItems={this.props.menuItems}
            >
                <TAForm
                    theme={this.props.theme}
                    confirmText="Remove"
                    primaryText={`Remove ${humanTypeName}`}
                    secondaryText={`Are you sure you want to remove ${this.props.item._id}?`}
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

RemoveForm.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    pathname: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    menuItems: PropTypes.array.isRequired,
    onRemove: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    route: PropTypes.object.isRequired
};

export default RemoveForm;
