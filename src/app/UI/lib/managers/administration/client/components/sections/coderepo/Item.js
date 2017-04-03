
import React from "react";
import LightComponent from "ui-lib/light_component";
import {
    Section as TASection
} from "ui-components/type_admin";
import { CodeRepositoryView } from "ui-components/data_view";

class Item extends LightComponent {
    render() {
        this.log("render", this.props, this.state);

        return (
            <TASection
                controls={this.props.controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <div className={this.props.theme.container}>
                    <CodeRepositoryView
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
