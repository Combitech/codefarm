
import React from "react";
import LightComponent from "ui-lib/light_component";
import { Container } from "ui-components/layout";
import { Section as TASection } from "ui-components/type_admin";
import { StatChartCard } from "ui-components/data_card";
import SavedStats from "../observables/saved_stats";

class List extends LightComponent {
    constructor(props) {
        super(props);

        this.savedStats = new SavedStats();

        this.state = {
            stats: this.savedStats.value.getValue(),
            state: this.savedStats.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.savedStats.start());
        this.addDisposable(this.savedStats.value.subscribe((stats) => this.setState({ stats })));
        this.addDisposable(this.savedStats.state.subscribe((state) => this.setState({ state })));
    }

    render() {
        this.log("render", this.props, this.state);

        const controls = this.props.controls.slice(0);

        const cardList = [];
        for (const stat of this.state.stats.toJS()) {
            stat.chartConfigs.forEach((chartCfg, index) =>
                cardList.push((
                    <StatChartCard
                        key={`${stat._id}-${index}`}
                        expandable={false}
                        expanded={true}
                        statId={stat._id}
                        chartConfig={chartCfg}
                        chartSize="small"
                    />
                ))
            );
        }

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <Container>
                    {cardList}
                </Container>
            </TASection>
        );
    }
}

List.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

List.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default List;
