import React from "react";
// import ImmutablePropTypes from "react-immutable-proptypes";
import LightComponent from "ui-lib/light_component";
import {
    LineChart, Line,
    BarChart, Bar,
    ScatterChart, Scatter,
    XAxis, YAxis, ZAxis,
    CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from "recharts";
import * as color from "ui-lib/colors";
import { flattenArray } from "misc";

const colorSeries = 500;
const colorNames = [
    "deepPurple", "pink", "indigo", "cyan", "green", "purple",
    "blue", "lightBlue", "teal", "lime", "yellow", "red",
    "amber", "orange", "deepOrange", "brown", "grey", "bluegrey"
];

const STROKE_PALETTE = colorNames.map((colorName) => color[`${colorName}${colorSeries}`]);

const CHART_MARGIN = { top: 5, right: 5, left: 5, bottom: 5 };

const AXIS_TYPE = {
    number: "number",
    category: "category"
};

const AXIS_SCALE = {
    auto: "auto",
    linear: "linear",
    pow: "pow",
    sqrt: "sqrt",
    log: "log",
    identity: "identity",
    band: "band",
    point: "point",
    ordinal: "ordinal",
    quantile: "quantile",
    quantize: "quantize",
    sequential: "sequential"
};

const CHART_TYPE = {
    line: "line",
    bar: "bar",
    scatter: "scatter"
};

class Chart extends LightComponent {
    render() {
        const xFields = this.props.xFields;
        const yFields = this.props.yFields;

        let chart = (
            <div className={this.props.theme.noGraph}>
                Nothing to plot
            </div>
        );
        try {
            const samples = this.props.samples;
            if (xFields.length > 0 && yFields.length > 0 && samples.length > 0) {
                const chartProps = {
                    data: samples,
                    margin: CHART_MARGIN
                };
                const commonComponents = [
                    <CartesianGrid key="grid" strokeDasharray="3 3"/>,
                    <Tooltip key="tooltip" />,
                    <Legend key="legend" />
                ];
                let chartComponent;
                if (this.props.chartType === CHART_TYPE.line) {
                    chartComponent = (
                        <LineChart {...chartProps}>
                            {xFields.map((field) => (
                                <XAxis
                                    key={`x_${field}`}
                                    dataKey={field}
                                    type={this.props.xAxisType}
                                    scale={this.props.xAxisScale}
                                    domain={[ "auto", "auto" ]}
                                />
                            ))}
                            <YAxis
                                type={this.props.yAxisType}
                                scale={this.props.yAxisScale}
                                domain={[ "auto", "auto" ]}
                            />
                            {commonComponents}
                            {yFields.map((field, index) => (
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
                    chartComponent = (
                        <BarChart {...chartProps}>
                            {xFields.map((field) => (
                                <XAxis
                                    key={`x_${field}`}
                                    dataKey={field}
                                    type="category"
                                    scale={this.props.xAxisScale}
                                    domain={[ "auto", "auto" ]}
                                />
                            ))}
                            <YAxis
                                type={this.props.yAxisType}
                                scale={this.props.yAxisScale}
                                domain={[ "auto", "auto" ]}
                            />
                            {commonComponents}
                            {yFields.map((field, index) => (
                                <Bar
                                    key={`y_${field}`}
                                    dataKey={field}
                                    fill={STROKE_PALETTE[index % STROKE_PALETTE.length]}
                                />
                            ))}
                        </BarChart>
                    );
                } else if (this.props.chartType === CHART_TYPE.scatter) {
                    const scatterProps = Object.assign({}, chartProps);
                    delete scatterProps.data;
                    const zFields = this.props.zFields.length > 0 ? this.props.zFields : [ "_z" ];
                    const xRange = [ Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER ];
                    const yRange = [ Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER ];
                    const zRange = [ Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER ];
                    const updateRange = (range, value) => {
                        range[0] = Math.min(range[0], value);
                        range[1] = Math.max(range[1], value);
                    };
                    const datas = flattenArray(this.props.yFields.map((yField) =>
                        this.props.xFields.map((xField) =>
                            zFields.map((zField) => ({
                                name: `y: ${yField}, x: ${xField}, z: ${zField}`,
                                samples: samples.map((item) => {
                                    const x = item[xField];
                                    const y = item[yField];
                                    const z = item[zField];
                                    updateRange(xRange, x);
                                    updateRange(yRange, y);
                                    updateRange(zRange, z);

                                    return Object.assign({
                                        _x: x,
                                        _y: y,
                                        _z: z
                                    }, item);
                                })
                            }))
                        )
                    ));
                    const zAxisRange = [
                        10,
                        // Tweak bubble size to not span whole chart...
                        800
                    ];
                    chartComponent = (
                        <ScatterChart {...scatterProps}>
                            <XAxis
                                dataKey={"_x"}
                                type={this.props.xAxisType}
                                scale={this.props.xAxisScale}
                                domain={[ "auto", "auto" ]}
                                name="x"
                            />
                            <YAxis
                                dataKey={"_y"}
                                type={this.props.yAxisType}
                                scale={this.props.yAxisScale}
                                domain={[ "auto", "auto" ]}
                                name="y"
                            />
                            <ZAxis
                                dataKey={"_z"}
                                range={zAxisRange}
                                type={this.props.zAxisType}
                                scale={this.props.zAxisScale}
                                domain={[ "auto", "auto" ]}
                                name="z"
                            />
                            {commonComponents}
                            {datas.map((data, index) => (
                                <Scatter
                                    key={`scatter_${index}`}
                                    name={data.name}
                                    data={data.samples}
                                    shape="circle"
                                    stroke={STROKE_PALETTE[index % STROKE_PALETTE.length]}
                                    fill={STROKE_PALETTE[index % STROKE_PALETTE.length]}
                                />
                            ))}
                        </ScatterChart>
                    );
                }
                chart = (
                    <ResponsiveContainer
                        width={this.props.width}
                        aspect={this.props.aspectRatio}
                    >
                        {chartComponent}
                    </ResponsiveContainer>
                );
            }
        } catch (error) {
            console.error("Failed to plot chart", error);
            chart = (
                <div className={this.props.theme.noGraph}>
                    Error in chart properties
                </div>
            );
        }

        return chart;
    }
}

Chart.defaultProps = {
    xAxisType: AXIS_TYPE.category,
    yAxisType: AXIS_TYPE.category,
    zAxisType: AXIS_TYPE.category,
    xAxisScale: AXIS_SCALE.auto,
    yAxisScale: AXIS_SCALE.auto,
    zAxisScale: AXIS_SCALE.auto,
    width: "100%",
    aspectRatio: 16 / 9
};

Chart.propTypes = {
    theme: React.PropTypes.object,
    samples: React.PropTypes.array.isRequired,
    xFields: React.PropTypes.array.isRequired,
    yFields: React.PropTypes.array.isRequired,
    zFields: React.PropTypes.array.isRequired,
    chartType: React.PropTypes.string.isRequired,
    xAxisType: React.PropTypes.string,
    yAxisType: React.PropTypes.string,
    zAxisType: React.PropTypes.string,
    xAxisScale: React.PropTypes.string,
    yAxisScale: React.PropTypes.string,
    zAxisScale: React.PropTypes.string,
    width: React.PropTypes.string,
    aspectRatio: React.PropTypes.number
};

export default Chart;
export {
    CHART_TYPE,
    AXIS_TYPE,
    AXIS_SCALE
};
