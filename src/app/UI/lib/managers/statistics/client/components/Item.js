
import React from "react";
import LightComponent from "ui-lib/light_component";
import { Container } from "ui-components/layout";
import {
    Section as TASection
} from "ui-components/type_admin";
import { StatChartCard } from "ui-components/data_card";
import { CHART_SIZE } from "ui-components/data_card/StatChartCard";

class Item extends LightComponent {
    render() {
        this.log("render", this.props, this.state);

        const controls = this.props.controls.slice(0);

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <Container>
                    <StatChartCard
                        theme={this.props.theme}
                        item={this.props.item}
                        chartSize={CHART_SIZE.xl}
                        expanded={true}
                        expandable={false}
                    />
                </Container>
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
