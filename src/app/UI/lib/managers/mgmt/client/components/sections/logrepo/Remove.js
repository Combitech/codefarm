
import React from "react";
import {
    Form as TAForm,
    Section as TASection
} from "ui-components/type_admin";
import LightComponent from "ui-lib/light_component";

class Remove extends LightComponent {
    render() {
        console.log("RemoveLocal-RENDER", this.props);

        return (
            <TASection
                breadcrumbs={this.props.breadcrumbs}
                controls={this.props.controls}
            >
                <TAForm
                    confirmText="Remove"
                    primaryText="Remove artifact repository backend"
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
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired,
    onRemove: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired
};

export default Remove;
