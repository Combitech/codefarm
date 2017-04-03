
import React from "react";
import LightComponent from "ui-lib/light_component";
import DataCard from "./DataCard";
import { CardTitle } from "react-toolbox/lib/card";
import stateVar from "ui-lib/state_var";
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

        const getFieldsToFetch = (props) =>
            props.item.serieFields
                .concat(props.item.dataFields)
                // Remove hardcoded fields...
                .filter((name) => !Object.keys(HARDCODED_FIELDS).includes(name));

        this.samples = new StatSamples({
            id: (props.expanded && props.item && props.item.statRef && props.item.statRef.id) || false,
            fields: getFieldsToFetch(props)
        });

        this.state = {
            expanded: stateVar(this, "expanded", props.expanded),
            samples: this.samples.value.getValue()
        };

        this._getFieldsToFetch = getFieldsToFetch;
    }

    componentDidMount() {
        this.addDisposable(this.samples.start());
        this.addDisposable(this.samples.value.subscribe((samples) => this.setState({ samples })));
    }

    componentWillReceiveProps(nextProps) {
        this.samples.setOpts({
            id: (nextProps.expanded && nextProps.item && nextProps.item.statRef && nextProps.item.statRef.id) || false,
            fields: this._getFieldsToFetch(nextProps)
        });
    }

    componentDidUpdate(/* prevProps, prevState */) {
        this.samples.setOpts({
            id: (this.state.expanded && this.props.item && this.props.item.statRef && this.props.item.statRef.id) || false
        });
    }

    render() {
        const serieFields = this.props.item.serieFields;
        const dataFields = this.props.item.dataFields;

        let samples = [];
        if (serieFields.length > 0 && dataFields.length > 0 && this.state.samples.size > 0) {
            samples = this.state.samples.toJS();
            samples.forEach((sample, index) => {
                sample._seq = index;
                sample[DEFAULT_X_AXIS] = moment(sample._collected).format("YYYY-MM-DD HH:mm:ss");
            });
        }

        let tags;
        if (this.props.item && this.props.item.tags && this.props.item.tags.length > 0) {
            tags = (
                <Tags list={this.props.item.tags} />
            );
        }

        return (
            <DataCard
                theme={this.props.theme}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
                path={this.props.path}
                inline={this.props.inline}
            >
                <CardTitle
                    title={this.props.item.name}
                />
                <If condition={this.state.expanded.value}>
                    <Chart
                        theme={this.props.theme}
                        samples={samples}
                        chartType={this.props.item.chartType}
                        xAxisType={this.props.item.xAxisType}
                        yAxisType={this.props.item.yAxisType}
                        serieFields={this.props.item.serieFields}
                        dataFields={this.props.item.dataFields}
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
    chartSize: "normal",
    inline: false
};

StatChartCard.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool,
    inline: React.PropTypes.bool,
    chartSize: React.PropTypes.string
};

StatChartCard.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default StatChartCard;
