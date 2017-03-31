import React from "react";
// import ImmutablePropTypes from "react-immutable-proptypes";
import LightComponent from "ui-lib/light_component";
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

const AXIS_TYPE = {
    number: "number",
    category: "category"
};

const CHART_TYPE = {
    line: "line",
    bar: "bar"
};

class Chart extends LightComponent {
    constructor(props) {
        super(props);
    }
    render() {
        const serieFields = this.props.serieFields;
        const dataFields = this.props.dataFields;

        let chart = (
            <div className={this.props.theme.noGraph}>
                Nothing to plot
            </div>
        );
        const samples = this.props.samples;
        if (serieFields.length > 0 && dataFields.length > 0 && samples.length > 0) {
            if (this.props.chartType === CHART_TYPE.line) {
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
                                type={this.props.xAxisType}
                            />
                        ))}
                        <YAxis type={this.props.yAxisType} />
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
            } else if (this.props.chartType === CHART_TYPE.bar) {
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
                        <YAxis type={this.props.yAxisType} />
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

        return chart;
    }
}

Chart.propTypes = {
    theme: React.PropTypes.object,
    samples: React.PropTypes.array.isRequired,
    serieFields: React.PropTypes.array.isRequired,
    dataFields: React.PropTypes.array.isRequired,
    chartType: React.PropTypes.string.isRequired,
    yAxisType: React.PropTypes.string.isRequired,
    xAxisType: React.PropTypes.string.isRequired
};

export default Chart;
export {
    CHART_TYPE,
    AXIS_TYPE
};
