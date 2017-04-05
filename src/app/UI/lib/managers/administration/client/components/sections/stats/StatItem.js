
import React from "react";
import Immutable from "immutable";
import LightComponent from "ui-lib/light_component";
import { Row, Column, Header, Section } from "ui-components/layout";
import { StatStatCard, CardList, StatChartCard } from "ui-components/data_card";
import {
    Section as TASection,
    ControlButton as TAControlButton
} from "ui-components/type_admin";
import TypeList from "ui-observables/type_list";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import * as pathBuilder from "ui-lib/path_builder";

class StatItem extends LightComponent {
    constructor(props) {
        super(props);

        this.charts = new TypeList({
            type: "stat.chart",
            query: (props.item && props.item._id)
                ? { "statRef.id": props.item._id, "statRef.type": "stat.stat" }
                : false
        });

        this.state = {
            charts: this.charts.value.getValue(),
            state: this.charts.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.charts.start());
        this.addDisposable(this.charts.value.subscribe((charts) => this.setState({ charts })));
        this.addDisposable(this.charts.state.subscribe((state) => this.setState({ state })));
    }

    componentWillReceiveProps(nextProps) {
        this.charts.setOpts({
            query: (nextProps.item && nextProps.item._id)
                ? { "statRef.id": nextProps.item._id, "statRef.type": "stat.stat" }
                : false
        });
    }

    render() {
        this.log("render", this.props, JSON.stringify(this.state, null, 2));

        const controls = this.props.controls.slice(0);
        controls.push((
            <TAControlButton
                theme={this.props.theme}
                key="explore"
                label="Explore Data"
                pathname={`${this.props.pathname}/explore`}
            />
        ));

        let list = [];
        if (this.state.state !== ObservableDataStates.LOADING) {
            list = this.state.charts.toJS().map((item) => ({
                id: item._id,
                time: 0,
                item: item,
                Card: StatChartCard,
                props: {
                    clickable: true,
                    path: pathBuilder.fromType("stat.chart", item, {
                        idMap: { "_id_chart": "_id" },
                        prefix: "admin"
                    })
                }
            }));
        }

        return (
            <div>
                <TASection
                    controls={controls}
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
                                    <Header label="Charts" />
                                    <CardList list={Immutable.fromJS(list)} />
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
