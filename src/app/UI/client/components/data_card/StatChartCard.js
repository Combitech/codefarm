
import React from "react";
import LightComponent from "ui-lib/light_component";
import DataCard from "./DataCard";
import { CardTitle, CardText } from "react-toolbox/lib/card";
import stateVar from "ui-lib/state_var";
import StatSamples from "ui-observables/stat_samples";
import moment from "moment";
import { Chart } from "ui-components/chart";
import Tags from "ui-components/tags";

const TIME_FIELD = "_t";
const CONSTANT_FIELD = "_constant";
const SEQ_FIELD = "_seq";

const HARDCODED_FIELDS = [
    TIME_FIELD, CONSTANT_FIELD, SEQ_FIELD
];

class StatChartCard extends LightComponent {
    constructor(props) {
        super(props);

        const getFieldsToFetch = (props) =>
            props.item.xFields
                .concat(props.item.yFields)
                .concat(props.item.zFields)
                // Remove hardcoded fields...
                .filter((name) => !HARDCODED_FIELDS.includes(name));

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
        const xFields = this.props.item.xFields;
        const yFields = this.props.item.yFields;

        let samples = [];
        if (xFields.length > 0 && yFields.length > 0 && this.state.samples.size > 0) {
            samples = this.state.samples.toJS();
            samples.forEach((sample, index) => {
                // TIME_FIELD, CONSTANT_FIELD, SEQ_FIELD
                sample[SEQ_FIELD] = index;
                sample[CONSTANT_FIELD] = 1;
                sample[TIME_FIELD] = moment(sample._collected).format("YYYY-MM-DD HH:mm:ss");
            });
        }

        let tags;
        if (this.props.item && this.props.item.tags && this.props.item.tags.length > 0) {
            tags = (
                <CardText>
                    <Tags list={this.props.item.tags} />
                </CardText>
            );
        }

        return (
            <DataCard
                theme={this.props.theme}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
                path={this.props.path}
                inline={this.props.inline}
                column={this.props.column}
            >
                <CardTitle
                    title={this.props.item.name}
                />
                <If condition={this.state.expanded.value}>
                    <div>
                        <Chart
                            theme={this.props.theme}
                            samples={samples}
                            chartType={this.props.item.chartType}
                            xAxisType={this.props.item.xAxisType}
                            yAxisType={this.props.item.yAxisType}
                            zAxisType={this.props.item.zAxisType}
                            xAxisScale={this.props.item.xAxisScale}
                            yAxisScale={this.props.item.yAxisScale}
                            zAxisScale={this.props.item.zAxisScale}
                            xFields={this.props.item.xFields}
                            yFields={this.props.item.yFields}
                            zFields={this.props.item.zFields}
                        />
                        {tags}
                    </div>
                </If>
            </DataCard>
        );
    }
}

StatChartCard.defaultProps = {
    expanded: false,
    expandable: true,
    inline: false,
    column: false
};

StatChartCard.propTypes = {
    theme: React.PropTypes.object,
    className: React.PropTypes.string,
    item: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool,
    inline: React.PropTypes.bool,
    column: React.PropTypes.bool
};

StatChartCard.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default StatChartCard;
export { TIME_FIELD, CONSTANT_FIELD, SEQ_FIELD };
