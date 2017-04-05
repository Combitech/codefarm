
import React from "react";
import LightComponent from "ui-lib/light_component";
import Input from "react-toolbox/lib/input";
import Switch from "react-toolbox/lib/switch";
import { Autocomplete } from "react-toolbox/lib/autocomplete";
import Dropdown from "react-toolbox/lib/dropdown";
import { Card, CardText } from "react-toolbox/lib/card";
import { Row, Column, Header, Section } from "ui-components/layout";
import { StatStatInfoCard, StatChartCard } from "ui-components/data_card";
import { CHART_SIZE } from "ui-components/data_card/StatChartCard";
import {
    Section as TASection,
    ControlButton as TAControlButton
} from "ui-components/type_admin";
import StatInfo from "ui-observables/stat_info";
import { CHART_TYPE, AXIS_TYPE } from "ui-components/chart";
import api from "api.io/api.io-client";
import Notification from "ui-observables/notification";
import * as pathBuilder from "ui-lib/path_builder";

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

class StatDataExplorer extends LightComponent {
    constructor(props) {
        super(props);

        const stat = this._getStat(props);

        const item = Object.assign({
            name: stat ? `Chart ${stat._id}` : "",
            yAxisType: AXIS_TYPE.number,
            xAxisType: AXIS_TYPE.category,
            chartType: CHART_TYPE.line,
            serieFields: [ DEFAULT_X_AXIS ],
            dataFields: (stat && stat.fieldNames) || [],
            pinned: false
        }, props.chartItem || {});

        this.statInfo = new StatInfo({
            id: stat && stat._id,
            fields: item.dataFields
        });

        this.state = {
            statInfo: this.statInfo.value.getValue(),
            _id: item._id,
            name: item.name,
            pinned: item.pinned,
            yAxisType: item.yAxisType,
            xAxisType: item.xAxisType,
            chartType: item.chartType,
            serieFields: item.serieFields,
            dataFields: item.dataFields
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
                    updateStateIfPropChanged("yAxisType");
                    updateStateIfPropChanged("xAxisType");
                    updateStateIfPropChanged("chartType");
                    updateStateIfPropChanged("serieFields");
                    updateStateIfPropChanged("dataFields");

                    return nextState;
                });
            }
        }
    }

    componentDidUpdate(/* prevProps, prevState */) {
        const fields = this.state.serieFields
            .concat(this.state.dataFields)
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
            serieFields: this.state.serieFields,
            dataFields: this.state.dataFields,
            chartType: this.state.chartType,
            yAxisType: this.state.yAxisType,
            xAxisType: this.state.xAxisType,
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

        const serieFields = this.state.serieFields;
        const dataFields = this.state.dataFields;

        const statInfo = this.state.statInfo
            .filter((info) => dataFields.includes(info.get("id")));

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