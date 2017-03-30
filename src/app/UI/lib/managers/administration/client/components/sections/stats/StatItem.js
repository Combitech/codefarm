
import React from "react";
import LightComponent from "ui-lib/light_component";
import { Row, Column, Header, Section } from "ui-components/layout";
import { StatStatCard } from "ui-components/data_card";
import {
    Section as TASection
} from "ui-components/type_admin";

class StatItem extends LightComponent {
    render() {
        this.log("render", this.props, JSON.stringify(this.state, null, 2));

        return (
            <div>
                <TASection
                    controls={this.props.controls}
                    breadcrumbs={this.props.breadcrumbs}
                >
                    <div className={this.props.theme.container}>
                        <Row>
                            <Column xs={12} md={5}>
                                <Section>
                                    <Header label="Properties" />
                                    <StatStatCard
                                        item={this.props.item}
                                        expanded={true}
                                        expandable={false}
                                    />
                                </Section>
                            </Column>
                        </Row>
                    </div>
                </TASection>
            </div>
        );
    }
}

StatItem.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

export default StatItem;
