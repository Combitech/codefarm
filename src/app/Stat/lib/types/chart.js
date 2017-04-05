"use strict";

const { ServiceMgr } = require("service");
const { assertType, assertProp, assertAnyOf } = require("misc");
const { Type } = require("typelib");

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

class Chart extends Type {
    constructor(data) {
        super();

        this.statRef = false;
        this.name = "";
        this.chartType = false;
        this.xAxisType = false;
        this.yAxisType = false;
        this.zAxisType = false;
        this.xFields = [];
        this.yFields = [];
        this.zFields = [];
        this.pinned = false;

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "chart";
    }

    static async _getDb() {
        return await ServiceMgr.instance.use("db");
    }

    static async _getMb() {
        return ServiceMgr.instance.msgBus;
    }

    static async validate(event, data) {
        assertProp(data, "_id", false);
        if (event === "create") {
            assertProp(data, "statRef", true);
            assertType(data.statRef, "data.statRef", "ref");
            assertProp(data, "name", true);
            assertProp(data, "chartType", true);
            assertProp(data, "xAxisType", true);
            assertProp(data, "yAxisType", true);
            assertProp(data, "zAxisType", true);
            assertProp(data, "xFields", true);
            assertProp(data, "yFields", true);
            assertProp(data, "zFields", true);
        } else if (event === "update") {
            // Update
        }

        if (data.hasOwnProperty("name")) {
            assertType(data.name, "data.name", "string");
        }
        if (data.hasOwnProperty("chartType")) {
            assertAnyOf(data, "chartType", "data.chartType", Object.values(CHART_TYPE));
        }
        if (data.hasOwnProperty("xAxisType")) {
            assertAnyOf(data, "xAxisType", "data.xAxisType", Object.values(AXIS_TYPE));
        }
        if (data.hasOwnProperty("yAxisType")) {
            assertAnyOf(data, "yAxisType", "data.yAxisType", Object.values(AXIS_TYPE));
        }
        if (data.hasOwnProperty("zAxisType")) {
            assertAnyOf(data, "zAxisType", "data.zAxisType", Object.values(AXIS_TYPE));
        }
        if (data.hasOwnProperty("xAxisScale")) {
            assertAnyOf(data, "xAxisScale", "data.xAxisScale", Object.values(AXIS_SCALE));
        }
        if (data.hasOwnProperty("yAxisScale")) {
            assertAnyOf(data, "yAxisScale", "data.yAxisScale", Object.values(AXIS_SCALE));
        }
        if (data.hasOwnProperty("zAxisScale")) {
            assertAnyOf(data, "zAxisScale", "data.zAxisScale", Object.values(AXIS_SCALE));
        }
        if (data.hasOwnProperty("xFields")) {
            assertType(data.xFields, "data.xFields", "array");
        }
        if (data.hasOwnProperty("yFields")) {
            assertType(data.yFields, "data.yFields", "array");
        }
        if (data.hasOwnProperty("zFields")) {
            assertType(data.zFields, "data.zFields", "array");
        }
        if (data.hasOwnProperty("pinned")) {
            assertType(data.pinned, "data.pinned", "boolean");
        }
    }
}

Chart.AXIS_TYPE = AXIS_TYPE;
Chart.CHART_TYPE = CHART_TYPE;
Chart.AXIS_SCALE = AXIS_SCALE;

module.exports = Chart;
