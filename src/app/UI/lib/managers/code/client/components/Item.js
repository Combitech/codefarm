
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { Follow } from "ui-components/follow";
import { Container } from "ui-components/layout";
import { Section as TASection } from "ui-components/type_admin";

class Item extends LightComponent {
    render() {
        this.log("render", this.props, this.state);

        return (
            <TASection
                controls={this.props.controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <Container>
                    <Follow
                        item={this.props.item}
                        pathname={this.props.pathname}
                        label="Revision"
                    />
            </Container>
            </TASection>
        );
    }
}

Item.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    pathname: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired
};

export default Item;
