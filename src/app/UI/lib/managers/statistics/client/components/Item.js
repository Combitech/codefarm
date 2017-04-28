
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { Container } from "ui-components/layout";
import {
    Section as TASection
} from "ui-components/type_admin";
import { StatChartCard } from "ui-components/data_card";

class Item extends LightComponent {
    render() {
        this.log("render", this.props, this.state);

        return (
            <TASection
                controls={this.props.controls}
                breadcrumbs={this.props.breadcrumbs}
                menuItems={this.props.menuItems}
            >
                <Container>
                    <StatChartCard
                        theme={this.props.theme}
                        item={this.props.item}
                        expanded={true}
                        expandable={false}
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
    controls: PropTypes.array.isRequired,
    menuItems: PropTypes.array.isRequired
};

export default Item;
