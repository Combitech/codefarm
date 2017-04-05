
import React from "react";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import Switch from "react-toolbox/lib/switch";
import { Autocomplete } from "react-toolbox/lib/autocomplete";
import Dropdown from "react-toolbox/lib/dropdown";
import { Card, CardText } from "react-toolbox/lib/card";
import { Row, Column, Header, Section } from "ui-components/layout";
import { StatStatInfoCard, StatChartCard } from "ui-components/data_card";
import {
    CHART_SIZE, TIME_FIELD, CONSTANT_FIELD, SEQ_FIELD
} from "ui-components/data_card/StatChartCard";
import {
    Section as TASection,
    ControlButton as TAControlButton
} from "ui-components/type_admin";
import StatInfo from "ui-observables/stat_info";
import { CHART_TYPE, AXIS_TYPE, AXIS_SCALE } from "ui-components/chart";
import api from "api.io/api.io-client";
import Notification from "ui-observables/notification";
import * as pathBuilder from "ui-lib/path_builder";

const DEFAULT_X_AXIS = SEQ_FIELD;
const DEFAULT_Z_AXIS = CONSTANT_FIELD;

const HARDCODED_FIELDS = {
    [ TIME_FIELD ]: "Collection time",
    [ CONSTANT_FIELD ]: "Constant",
    [ SEQ_FIELD ]: "Sample index"
};

const axisTypes = [
    { value: AXIS_TYPE.category, label: "Category" },
    { value: AXIS_TYPE.number, label: "Numeric" }
];

const axisScales = [
    { value: AXIS_SCALE.auto, label: "Auto" },
    { value: AXIS_SCALE.linear, label: "Linear" },
    { value: AXIS_SCALE.pow, label: "Power of 10" },
    { value: AXIS_SCALE.sqrt, label: "Square root" },
    { value: AXIS_SCALE.log, label: "Logarithmic" },
    { value: AXIS_SCALE.sequential, label: "Sequential" }
];

const chartTypes = [
    { value: CHART_TYPE.line, label: "Line chart" },
    { value: CHART_TYPE.bar, label: "Bar chart" },
    { value: CHART_TYPE.scatter, label: "Scatter chart" }
];

class StatDataExplorer extends LightComponent {
    constructor(props) {
        super(props);

        const stat = this._getStat(props);

        const item = Object.assign({
            name: stat ? `Chart ${stat._id}` : "",
            xAxisType: AXIS_TYPE.number,
            yAxisType: AXIS_TYPE.number,
            zAxisType: AXIS_TYPE.number,
            xAxisScale: AXIS_SCALE.auto,
            yAxisScale: AXIS_SCALE.auto,
            zAxisScale: AXIS_SCALE.auto,
            chartType: CHART_TYPE.line,
            xFields: [ DEFAULT_X_AXIS ],
            yFields: (stat && stat.fieldNames) || [],
            zFields: [ DEFAULT_Z_AXIS ],
            pinned: false
        }, props.chartItem || {});

        this.statInfo = new StatInfo({
            id: stat && stat._id,
            fields: item.yFields
        });

        this.state = {
            statInfo: this.statInfo.value.getValue(),
            _id: item._id,
            name: item.name,
            pinned: item.pinned,
            chartType: item.chartType,
            xAxisType: item.xAxisType,
            yAxisType: item.yAxisType,
            zAxisType: item.zAxisType,
            xAxisScale: item.xAxisScale,
            yAxisScale: item.yAxisScale,
            zAxisScale: item.zAxisScale,
            xFields: item.xFields,
            yFields: item.yFields,
            zFields: item.zFields
        };
    }

    _getStat(props = null) {
        props = props || this.props;

        return props.statItem || props.parentItems.find((item) => item.type === "stat.stat");
    }

    _getFields() {
        const stat = this._getStat();
        const fieldNames = (stat && stat.fieldNames) || [];
        const fields = Object.assign({}, HARDCODED_FIELDS);
        fieldNames.forEach((key) =>
            fields[key] = key
        );

        return fields;
    }

    componentDidMount() {
        this.addDisposable(this.statInfo.start());
        this.addDisposable(this.statInfo.value.subscribe((statInfo) => this.setState({ statInfo })));
    }

    componentWillReceiveProps(nextProps) {
        const stat = this._getStat(nextProps);
        this.statInfo.setOpts({
            id: stat && stat._id
        });

        const nextChartId = nextProps.chartItem && nextProps.chartItem._id;
        const currChartId = this.props.chartItem && this.props.chartItem._id;
        if (nextChartId !== currChartId) {
            this.setState({ _id: nextChartId });
        }

        if (nextProps.chartItem) {
            if (!this.props.chartItem ||
                (JSON.stringify(nextProps.chartItem) !== JSON.stringify(this.props.chartItem))) {
                this.setState((state, props) => {
                    const nextState = {};
                    const updateStateIfPropChanged = (fieldName) => {
                        if (props.chartItem && props.chartItem[fieldName] && props.chartItem[fieldName] !== state[fieldName]) {
                            nextState[fieldName] = state[fieldName];
                        }
                    };

                    updateStateIfPropChanged("_id");
                    updateStateIfPropChanged("name");
                    updateStateIfPropChanged("pinned");
                    updateStateIfPropChanged("chartType");
                    updateStateIfPropChanged("xAxisType");
                    updateStateIfPropChanged("yAxisType");
                    updateStateIfPropChanged("zAxisType");
                    updateStateIfPropChanged("xAxisScale");
                    updateStateIfPropChanged("yAxisScale");
                    updateStateIfPropChanged("zAxisScale");
                    updateStateIfPropChanged("xFields");
                    updateStateIfPropChanged("yFields");
                    updateStateIfPropChanged("zFields");

                    return nextState;
                });
            }
        }
    }

    componentDidUpdate(/* prevProps, prevState */) {
        const fields = this.state.xFields
            .concat(this.state.yFields)
            .concat(this.state.zFields)
            // Remove hardcoded fields...
            .filter((name) => !Object.keys(HARDCODED_FIELDS).includes(name));

        this.statInfo.setOpts({ fields });
    }

    _getChartData() {
        const stat = this._getStat();

        return {
            _id: this.state._id,
            name: this.state.name,
            statRef: {
                _ref: true,
                type: "stat.stat",
                id: stat && stat._id
            },
            chartType: this.state.chartType,
            xFields: this.state.xFields,
            yFields: this.state.yFields,
            zFields: this.state.zFields,
            xAxisType: this.state.xAxisType,
            yAxisType: this.state.yAxisType,
            zAxisType: this.state.zAxisType,
            xAxisScale: this.state.xAxisScale,
            yAxisScale: this.state.yAxisScale,
            zAxisScale: this.state.zAxisScale,
            pinned: this.state.pinned
        };
    }

    async _saveChart(forceSaveAsNew = false) {
        const chart = this._getChartData();
        const id = forceSaveAsNew ? false : chart._id;
        delete chart._id;
        const isUpdate = typeof id === "string";

        try {
            if (isUpdate) {
                const res = await api.rest.save("stat.chart", id, chart);
                Notification.instance.publish(`Chart ${res.name} saved successfully!`);
                console.log("Save stat.chart success!", res);
            } else {
                const res = await api.rest.post("stat.chart", chart);
                Notification.instance.publish(`Chart ${res.name} created successfully!`);
                console.log("Create stat.chart success!", res);

                // Redirect to new chart admin page
                const idMap = { "_id_chart": "_id" };
                const newPath = pathBuilder.fromType("stat.chart", res, { idMap, prefix: "admin" });
                this.context.router.push({ pathname: newPath });
            }
        } catch (error) {
            console.error("Create stat.chart failed", error);
            const opStr = isUpdate ? "save" : "create";
            Notification.instance.publish(`Chart ${opStr} failed with error ${error.message || error}!`);
        }
    }

    render() {
        this.log("render", this.props, JSON.stringify(this.state, null, 2));

        const item = this._getChartData();

        const controls = this.props.controls.slice(0);
        controls.push((
            <TAControlButton
                key="save_as_new"
                label="Save as new"
                onClick={() => this._saveChart(true)}
            />
        ));
        if (item._id) {
            controls.push((
                <TAControlButton
                    key="save"
                    label="Save"
                    onClick={() => this._saveChart()}
                />
            ));
        }

        const xFields = this.state.xFields;
        const yFields = this.state.yFields;
        const zFields = this.state.zFields;

        const statInfo = this.state.statInfo
            .filter((info) => yFields.includes(info.get("id")));

        const availableFields = this._getFields();

        const statInfoRows = statInfo.map((info) => (
            <Row key={info.get("id")}>
                <StatStatInfoCard
                    item={info.toJS()}
                    expandable={true}
                    expanded={false}
                />
            </Row>
        ));

        const hasX = true;
        const hasY = true;
        const hasZ = this.state.chartType === CHART_TYPE.scatter;

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <div className={this.props.theme.container}>
                    <Row>
                        <Column xs={12} md={5}>
                            <Section>
                                <Header label="Properties" />
                                <Row>
                                    <Card theme={this.props.theme}>
                                        <CardText>
                                            <Row>
                                                <Column xs={12} md={6}>
                                                    <Input
                                                        type="text"
                                                        label="Chart title"
                                                        value={this.state.name}
                                                        onChange={(name) => this.setState({ name })}
                                                    />
                                                </Column>
                                                <Column xs={12} md={6}>
                                                    <Switch
                                                        type="text"
                                                        label="Pinned to public view"
                                                        checked={this.state.pinned}
                                                        onChange={(pinned) => this.setState({ pinned })}
                                                    />
                                                </Column>
                                            </Row>
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
                                            <If condition={hasX}>
                                                <Row>
                                                    <Column xs={12} md={6}>
                                                        <Autocomplete
                                                            direction="down"
                                                            selectedPosition="below"
                                                            label="Select X-axis fields"
                                                            onChange={(xFields) => this.setState({ xFields })}
                                                            source={availableFields}
                                                            value={xFields}
                                                        />
                                                    </Column>
                                                    <Column xs={12} md={3}>
                                                        <Dropdown
                                                            label="X-axis type"
                                                            disabled={this.state.chartType === CHART_TYPE.bar}
                                                            value={this.state.xAxisType}
                                                            source={axisTypes}
                                                            onChange={(xAxisType) => this.setState({ xAxisType })}
                                                        />
                                                    </Column>
                                                    <Column xs={12} md={3}>
                                                        <Dropdown
                                                            label="X-axis scale"
                                                            value={this.state.xAxisScale}
                                                            source={axisScales}
                                                            onChange={(xAxisScale) => this.setState({ xAxisScale })}
                                                        />
                                                    </Column>
                                                </Row>
                                            </If>
                                            <If condition={hasY}>
                                                <Row>
                                                    <Column xs={12} md={6}>
                                                        <Autocomplete
                                                            direction="down"
                                                            selectedPosition="below"
                                                            label="Select Y-axis fields"
                                                            onChange={(yFields) => this.setState({ yFields })}
                                                            source={availableFields}
                                                            value={yFields}
                                                        />
                                                    </Column>
                                                    <Column xs={12} md={3}>
                                                        <Dropdown
                                                            label="Y-axis type"
                                                            value={this.state.yAxisType}
                                                            source={axisTypes}
                                                            onChange={(yAxisType) => this.setState({ yAxisType })}
                                                        />
                                                    </Column>
                                                    <Column xs={12} md={3}>
                                                        <Dropdown
                                                            label="Y-axis scale"
                                                            value={this.state.yAxisScale}
                                                            source={axisScales}
                                                            onChange={(yAxisScale) => this.setState({ yAxisScale })}
                                                        />
                                                    </Column>
                                                </Row>
                                            </If>
                                            <If condition={hasZ}>
                                                <Row>
                                                    <Column xs={12} md={6}>
                                                        <Autocomplete
                                                            direction="down"
                                                            selectedPosition="below"
                                                            label="Select Z-axis fields"
                                                            onChange={(zFields) => this.setState({ zFields })}
                                                            source={availableFields}
                                                            value={zFields}
                                                        />
                                                    </Column>
                                                    <Column xs={12} md={3}>
                                                        <Dropdown
                                                            label="Z-axis type"
                                                            value={this.state.zAxisType}
                                                            source={axisTypes}
                                                            onChange={(zAxisType) => this.setState({ zAxisType })}
                                                        />
                                                    </Column>
                                                    <Column xs={12} md={3}>
                                                        <Dropdown
                                                            label="Z-axis scale"
                                                            value={this.state.zAxisScale}
                                                            source={axisScales}
                                                            onChange={(zAxisScale) => this.setState({ zAxisScale })}
                                                        />
                                                    </Column>
                                                </Row>
                                            </If>
                                        </CardText>
                                    </Card>
                                </Row>
                            </Section>
                            <Section>
                                <Header label="Characteristics" />
                                {statInfoRows}
                            </Section>
                        </Column>
                        <Column xs={12} md={7}>
                            <Section>
                                <Header label="Chart" />
                                <StatChartCard
                                    theme={this.props.theme}
                                    item={item}
                                    chartSize={CHART_SIZE.lg}
                                    expanded={true}
                                    expandable={false}
                                />
                            </Section>
                        </Column>
                    </Row>
                </div>
            </TASection>
        );
    }
}

StatDataExplorer.defaultProps = {
    chartItem: null,
    statItem: null
};

StatDataExplorer.propTypes = {
    theme: React.PropTypes.object,
    chartItem: React.PropTypes.object,
    statItem: React.PropTypes.object,
    pathname: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired
};

StatDataExplorer.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default StatDataExplorer;
