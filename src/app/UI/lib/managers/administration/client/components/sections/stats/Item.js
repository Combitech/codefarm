
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { Row, Column, Header, Section } from "ui-components/layout";
import { StatSpecCard } from "ui-components/data_card";
import {
    Section as TASection,
    PagedList as TAPagedList
} from "ui-components/type_admin";

class Item extends LightComponent {
    render() {
        this.log("render", this.props, this.state);

        return (
            <TASection
                controls={this.props.controls}
                breadcrumbs={this.props.breadcrumbs}
                menuItems={this.props.menuItems}
            >
                <div className={this.props.theme.container}>
                    <Row>
                        <Column xs={12} md={5}>
                            <Section>
                                <Header label="Properties" />
                                <StatSpecCard
                                    item={this.props.item}
                                    expanded={true}
                                    expandable={false}
                                />
                            </Section>
                        </Column>
                        <Column xs={12} md={7}>
                            <Section>
                                <Header label="Measurements" />
                                <TAPagedList
                                    type="stat.stat"
                                    query={{
                                        "specRef.id": this.props.item._id,
                                        "specRef.type": "stat.spec"
                                    }}
                                    limit={10}
                                    onSelect={(item) => {
                                        this.context.router.push({
                                            pathname: `${this.props.pathname}/${item._id}`
                                        });
                                    }}
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
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    pathname: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    menuItems: PropTypes.array.isRequired
};

Item.contextTypes = {
    router: PropTypes.object.isRequired
};

export default Item;
