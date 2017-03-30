
import React from "react";
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

        const controls = this.props.controls.slice(0);

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
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
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

Item.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default Item;
