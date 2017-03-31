
import React from "react";
import LightComponent from "ui-lib/light_component";
import { Autocomplete } from "react-toolbox/lib/autocomplete";
import Dropdown from "react-toolbox/lib/dropdown";
import { Row, Column, Header, Section } from "ui-components/layout";
import { StatStatCard, StatStatInfoCard } from "ui-components/data_card";
import {
    Section as TASection
} from "ui-components/type_admin";
import StatSamples from "ui-observables/stat_samples";
import StatInfo from "ui-observables/stat_info";
import moment from "moment";
import { Chart, CHART_TYPE, AXIS_TYPE } from "ui-components/chart";

const DEFAULT_X_AXIS = "_t";

const HARDCODED_FIELDS = {
    [ DEFAULT_X_AXIS ]: "Collection time",
    "_seq": "Sample index"
};

const axisTypes = [
    { value: AXIS_TYPE.category, label: "Category" },
    { value: AXIS_TYPE.number, label: "Numeric" }
];

const chartTypes = [
    { value: CHART_TYPE.line, label: "Line chart" },
    { value: CHART_TYPE.bar, label: "Bar chart" }
];

class StatItem extends LightComponent {
    constructor(props) {
        super(props);

        const availableFields = (props.item && props.item.fieldNames) || [];

        this.samples = new StatSamples({
            id: props.item && props.item._id,
            fields: availableFields
        });
        this.statInfo = new StatInfo({
            id: props.item && props.item._id,
            fields: availableFields
        });

        this.state = {
            samples: this.samples.value.getValue(),
            statInfo: this.statInfo.value.getValue(),
            serieFields: [ DEFAULT_X_AXIS ],
            dataFields: availableFields,
            yAxisType: AXIS_TYPE.number,
            xAxisType: AXIS_TYPE.category,
            chartType: CHART_TYPE.line
        };
    }

    _getFields() {
        const fieldNames = (this.props.item && this.props.item.fieldNames) || [];
        const fields = Object.assign({}, HARDCODED_FIELDS);
        fieldNames.forEach((key) =>
            fields[key] = key
        );

        return fields;
    }

    componentDidMount() {
        this.addDisposable(this.samples.start());
        this.addDisposable(this.samples.value.subscribe((samples) => this.setState({ samples })));
        this.addDisposable(this.statInfo.start());
        this.addDisposable(this.statInfo.value.subscribe((statInfo) => this.setState({ statInfo })));
    }

    componentWillReceiveProps(nextProps) {
        this.samples.setOpts({
            id: nextProps.item && nextProps.item.id
        });
        this.statInfo.setOpts({
            id: nextProps.item && nextProps.item.id
        });
    }

    componentDidUpdate(/* prevProps, prevState */) {
        const fields = this.state.serieFields
            .concat(this.state.dataFields)
            // Remove hardcoded fields...
            .filter((name) => !Object.keys(HARDCODED_FIELDS).includes(name));

        this.samples.setOpts({ fields });
        this.statInfo.setOpts({ fields });
    }

    render() {
        this.log("render", this.props, JSON.stringify(this.state, null, 2));

        const serieFields = this.state.serieFields;
        const dataFields = this.state.dataFields;

        let samples = [];
        if (serieFields.length > 0 && dataFields.length > 0 && this.state.samples.size > 0) {
            samples = this.state.samples.toJS();
            samples.forEach((sample, index) => {
                sample._seq = index;
                sample[DEFAULT_X_AXIS] = moment(sample._collected).format("YYYY-MM-DD HH:mm:ss");
            });
        }
        const chart = (
            <Chart
                theme={this.props.theme}
                samples={samples}
                serieFields={serieFields}
                dataFields={dataFields}
                chartType={this.state.chartType}
                yAxisType={this.state.yAxisType}
                xAxisType={this.state.xAxisType}
            />
        );

        const statInfo = this.state.statInfo
            .filter((info) => dataFields.includes(info.get("id")));

        const availableFields = this._getFields();

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
                                    <Header label="Data explorer" />
                                    <Row>
                                        <Column xs={12} md={6}>
                                            <Dropdown
                                                label="Chart type"
                                                value={this.state.chartType}
                                                source={chartTypes}
                                                onChange={(chartType) => this.setState({ chartType })}
                                            />
                                        </Column>
                                    </Row>
                                    <Row>
                                        <Column xs={12} md={6}>
                                            <Autocomplete
                                                direction="down"
                                                selectedPosition="below"
                                                label="Select data fields"
                                                onChange={(dataFields) => this.setState({ dataFields })}
                                                source={availableFields}
                                                value={dataFields}
                                            />
                                        </Column>
                                        <Column xs={12} md={6}>
                                            <Autocomplete
                                                direction="down"
                                                selectedPosition="below"
                                                label="Select series field"
                                                onChange={(serieFields) => this.setState({ serieFields })}
                                                source={availableFields}
                                                value={serieFields}
                                            />
                                        </Column>
                                    </Row>
                                    <Row>
                                        <Column xs={12} md={6}>
                                            <Dropdown
                                                label="Y-axis type"
                                                value={this.state.yAxisType}
                                                source={axisTypes}
                                                onChange={(yAxisType) => this.setState({ yAxisType })}
                                            />
                                        </Column>
                                        <Column xs={12} md={6}>
                                            <Dropdown
                                                label="X-axis type"
                                                disabled={this.state.chartType === CHART_TYPE.bar}
                                                value={this.state.xAxisType}
                                                source={axisTypes}
                                                onChange={(xAxisType) => this.setState({ xAxisType })}
                                            />
                                        </Column>
                                    </Row>
                                    <Row>
                                        {chart}
                                    </Row>
                                    <Row>
                                        {statInfo.map((info) => (
                                            <StatStatInfoCard
                                                key={info.get("id")}
                                                item={info.toJS()}
                                                expandable={true}
                                                expanded={false}
                                            />
                                        ))}
                                    </Row>
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
