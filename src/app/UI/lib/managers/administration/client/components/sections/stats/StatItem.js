
import React from "react";
import LightComponent from "ui-lib/light_component";
import { Row, Column, Header, Section } from "ui-components/layout";
import { StatStatCard } from "ui-components/data_card";
import {
    Section as TASection
} from "ui-components/type_admin";
import StatSamples from "ui-observables/stat_samples";

class StatItem extends LightComponent {
    constructor(props) {
        super(props);

        this.samples = new StatSamples({
            id: props.item && props.item._id,
            fields: [ "execTimeMs", "queueTimeMs" ]
        });

        this.state = {
            samples: this.samples.value.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.samples.start());
        this.addDisposable(this.samples.value.subscribe((samples) => this.setState({ samples })));
    }

    componentWillReceiveProps(nextProps) {
        this.samples.setOpts({
            id: nextProps.item && nextProps.item.id
        });
    }

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
                            <Column xs={12} md={7}>
                                <Section>
                                    <Header label="Samples" />
                                    <pre>
                                        {JSON.stringify(this.state.samples.toJS(), null, 2)}
                                    </pre>
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
