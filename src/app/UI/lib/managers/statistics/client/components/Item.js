
import React from "react";
import LightComponent from "ui-lib/light_component";
import { Container } from "ui-components/layout";
import {
    Section as TASection,
    ControlButton as TAControlButton
} from "ui-components/type_admin";
import { StatChartCard } from "ui-components/data_card";
import { CHART_SIZE } from "ui-components/data_card/StatChartCard";
import { isTokenValidForAccess } from "auth/lib/util";

class Item extends LightComponent {
    render() {
        this.log("render", this.props, this.state);
        const userPriv = this.props.activeUser.has("priv") && this.props.activeUser.get("priv").toJS();
        const hasUpdateAccess = isTokenValidForAccess(
            userPriv, this.props.item.type, "update", { throwOnError: false }
        );

        const controls = this.props.controls.slice(0);
        controls.push((
            <TAControlButton
                theme={this.props.theme}
                key="edit"
                label="Edit"
                disabled={!hasUpdateAccess}
                pathname={`${this.props.pathname}/edit`}
            />
        ));

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
