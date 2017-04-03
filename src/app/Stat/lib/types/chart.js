"use strict";

const { ServiceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");

const AXIS_TYPE = {
    number: "number",
    category: "category"
};

const CHART_TYPE = {
    line: "line",
    bar: "bar"
};

class Chart extends Type {
    constructor(data) {
        super();

        this.statRef = false;
        this.name = "";
        this.chartType = false;
        this.xAxisType = false;
        this.yAxisType = false;
        this.serieFields = [];
        this.dataFields = [];

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
            assertProp(data, "serieFields", true);
            assertProp(data, "dataFields", true);
        } else if (event === "update") {
            // Update
        }

        if (data.hasOwnProperty("name")) {
            assertType(data.name, "data.name", "string");
        }
        if (data.hasOwnProperty("chartType")) {
            assertType(data.chartType, "data.chartType", "string");
            if (!Object.values(CHART_TYPE).includes(data.chartType)) {
                throw new Error(`Unkown chart type ${data.chartType}`);
            }
        }
        if (data.hasOwnProperty("xAxisType")) {
            assertType(data.xAxisType, "data.xAxisType", "string");
            if (!Object.values(AXIS_TYPE).includes(data.xAxisType)) {
                throw new Error(`Unkown x axis type ${data.xAxisType}`);
            }
        }
        if (data.hasOwnProperty("yAxisType")) {
            assertType(data.yAxisType, "data.yAxisType", "string");
            if (!Object.values(AXIS_TYPE).includes(data.yAxisType)) {
                throw new Error(`Unkown y axis type ${data.yAxisType}`);
            }
        }
        if (data.hasOwnProperty("serieFields")) {
            assertType(data.serieFields, "data.serieFields", "array");
        }
        if (data.hasOwnProperty("dataFields")) {
            assertType(data.dataFields, "data.dataFields", "array");
        }
    }
}

Chart.AXIS_TYPE = AXIS_TYPE;
Chart.CHART_TYPE = CHART_TYPE;

module.exports = Chart;
