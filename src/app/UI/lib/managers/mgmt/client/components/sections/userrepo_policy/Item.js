
import React from "react";
import {
    Section as TASection
} from "ui-components/type_admin";
import { Row, Column, Header, Section } from "ui-components/layout";
import { PolicyCard } from "ui-components/data_card";
import LightComponent from "ui-lib/light_component";

class Item extends LightComponent {
    render() {
        console.log("ItemLocal-RENDER", this.props);

        return (
            <TASection
                controls={this.props.controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <div className={this.props.theme.container}>
                    <Row>
                        <Column xs={12} md={5}>
                            <Section>
                                <Header label="Properties" />
                                <PolicyCard
                                    theme={this.props.theme}
                                    item={this.props.item}
                                    expandable={false}
                                    expanded={true}
                                />
                            </Section>
                        </Column>
                    </Row>
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
