
import React from "react";
import LightComponent from "ui-lib/light_component";
import DataCard from "./DataCard";
import { CardTitle } from "react-toolbox/lib/card";
import stateVar from "ui-lib/state_var";
import TypeItem from "ui-observables/type_item";
import StatSamples from "ui-observables/stat_samples";
import moment from "moment";
import { Chart } from "ui-components/chart";
import Tags from "ui-components/tags";

const CHART_DIM = {
    big: { width: 800, height: 600 },
    normal: { width: 600, height: 300 },
    small: { width: 300, height: 200 }
};

const DEFAULT_X_AXIS = "_t";

const HARDCODED_FIELDS = {
    [ DEFAULT_X_AXIS ]: "Collection time",
    "_seq": "Sample index"
};

class StatChartCard extends LightComponent {
    constructor(props) {
        super(props);

        this.item = new TypeItem({
            type: "stat.stat",
            id: props.statId,
            subscribe: true
        });

        const getFieldsToFetch = (props) =>
            props.chartConfig.serieFields
                .concat(props.chartConfig.dataFields)
                // Remove hardcoded fields...
                .filter((name) => !Object.keys(HARDCODED_FIELDS).includes(name));

        this.samples = new StatSamples({
            id: props.statId,
            fields: getFieldsToFetch(props)
        });

        this.state = {
            expanded: stateVar(this, "expanded", this.props.expanded),
            samples: this.samples.value.getValue(),
            item: this.item.value.getValue()
        };

        this._getFieldsToFetch = getFieldsToFetch;
    }

    componentDidMount() {
        this.addDisposable(this.item.start());
        this.addDisposable(this.item.value.subscribe((item) => this.setState({ item })));
        this.addDisposable(this.samples.start());
        this.addDisposable(this.samples.value.subscribe((samples) => this.setState({ samples })));
    }

    componentWillReceiveProps(nextProps) {
        this.item.setOpts({
            id: nextProps.statId
        });
        this.samples.setOpts({
            id: nextProps.statId,
            fields: this._getFieldsToFetch(nextProps)
        });
    }

    render() {
        const serieFields = this.props.chartConfig.serieFields;
        const dataFields = this.props.chartConfig.dataFields;

        let samples = [];
        if (serieFields.length > 0 && dataFields.length > 0 && this.state.samples.size > 0) {
            samples = this.state.samples.toJS();
            samples.forEach((sample, index) => {
                sample._seq = index;
                sample[DEFAULT_X_AXIS] = moment(sample._collected).format("YYYY-MM-DD HH:mm:ss");
            });
        }

        let tags;
        if (this.state.item && this.state.item.get("tags", []).size > 0) {
            tags = (
                <Tags list={this.state.item.get("tags").toJS()} />
            );
        }

        return (
            <DataCard
                theme={this.props.theme}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
            >
                <CardTitle
                    title={this.props.chartConfig.title}
                />
                <If condition={this.state.expanded.value}>
                    <Chart
                        theme={this.props.theme}
                        samples={samples}
                        {...this.props.chartConfig}
                        {...CHART_DIM[this.props.chartSize]}
                    />
                    {tags}
                </If>
            </DataCard>
        );
    }
}

StatChartCard.defaultProps = {
    expanded: false,
    expandable: true,
    chartSize: "normal"
};

StatChartCard.propTypes = {
    theme: React.PropTypes.object,
    statId: React.PropTypes.string.isRequired,
    chartConfig: React.PropTypes.object.isRequired,
    chartSize: React.PropTypes.string,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool
};

StatChartCard.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default StatChartCard;
