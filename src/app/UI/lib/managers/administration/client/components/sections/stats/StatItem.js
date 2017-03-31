
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
import {
    LineChart, Line,
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import * as color from "ui-lib/colors";

const colorSeries = 500;
const colorNames = [
    "deepPurple", "pink", "indigo", "cyan", "green", "purple",
    "blue", "lightBlue", "teal", "lime", "yellow", "red",
    "amber", "orange", "deepOrange", "brown", "grey", "bluegrey"
];

const STROKE_PALETTE = colorNames.map((colorName) => color[`${colorName}${colorSeries}`]);

const CHART_WIDTH = 600;
const CHART_HEIGHT = 300;
const CHART_MARGIN = { top: 5, right: 30, left: 20, bottom: 5 };

const DEFAULT_X_AXIS = "_t";

const HARDCODED_FIELDS = {
    [ DEFAULT_X_AXIS ]: "Collection time",
    "_seq": "Sample index"
};

// Keys matches recharts XAxis property type values
const AXIS_TYPE = {
    number: "number",
    category: "category"
};

const axisTypes = [
    { value: AXIS_TYPE.category, label: "Category" },
    { value: AXIS_TYPE.number, label: "Numeric" }
];

const CHART_TYPE = {
    line: "line",
    bar: "bar"
};

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

        let chart = (
            <div className={this.props.theme.noGraph}>
                Nothing to plot
            </div>
        );
        if (serieFields.length > 0 && dataFields.length > 0 && this.state.samples.size > 0) {
            const samples = this.state.samples.toJS();
            samples.forEach((sample, index) => {
                sample._seq = index;
                sample[DEFAULT_X_AXIS] = moment(sample._collected).format("YYYY-MM-DD HH:mm:ss");
            });

            if (this.state.chartType === CHART_TYPE.line) {
                chart = (
                    <LineChart
                        width={CHART_WIDTH}
                        height={CHART_HEIGHT}
                        data={samples}
                        margin={CHART_MARGIN}
                    >
                        {serieFields.map((field) => (
                            <XAxis
                                key={`x_${field}`}
                                dataKey={field}
                                type={this.state.xAxisType}
                            />
                        ))}
                        <YAxis type={this.state.yAxisType} />
                        <CartesianGrid strokeDasharray="3 3"/>
                        <Tooltip/>
                        <Legend />
                        {dataFields.map((field, index) => (
                            <Line
                                key={`y_${field}`}
                                dataKey={field}
                                type="monotone"
                                stroke={STROKE_PALETTE[index % STROKE_PALETTE.length]}
                                activeDot={{ r: 8 }}
                            />
                        ))}
                    </LineChart>
                );
            } else if (this.state.chartType === CHART_TYPE.bar) {
                chart = (
                    <BarChart
                        width={CHART_WIDTH}
                        height={CHART_HEIGHT}
                        data={samples}
                        margin={CHART_MARGIN}
                    >
                        {serieFields.map((field) => (
                            <XAxis
                                key={`x_${field}`}
                                dataKey={field}
                                type="category"
                            />
                        ))}
                        <YAxis type={this.state.yAxisType} />
                        <CartesianGrid strokeDasharray="3 3"/>
                        <Tooltip/>
                        <Legend />
                        {dataFields.map((field, index) => (
                            <Bar
                                key={`y_${field}`}
                                dataKey={field}
                                fill={STROKE_PALETTE[index % STROKE_PALETTE.length]}
                            />
                        ))}
                    </BarChart>
                );
            }
        }

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
