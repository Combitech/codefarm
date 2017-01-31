"use strict";

const { ObjSerialize } = require("misc");

const DEFAULT_INDENT = 2;

const formatters = {
    // eslint-disable-next-line valid-jsdoc
    /** Raw applies no formatting... */
    raw: (d) => d,

    /** One-line json
     * example output:
     * {"key1": "val1","a":[0,1]}
     */
    json: JSON.stringify,

    // eslint-disable-next-line valid-jsdoc
    /** Multi-line json with indentation
     * example output:
     * {
     *   "key1": "val1",
     *   "a": [
     *     0,
     *     1
     *   ]
     * }
     */
    jsonPretty: (d) => JSON.stringify(d, null, DEFAULT_INDENT),

    // eslint-disable-next-line valid-jsdoc
    /** Output values, one value per line.
     * Note! Only array output is supported
     * example output:
     * - with input: {key1: "val1", a:[ 0,1 ]}:
     * val1
     * <Array>
     * - with input: ["val1", 10}:
     * val1
     * 10
     */
    values: (d) => {
        let values = [];
        if (d instanceof Array) {
            values = d;
        } else if (typeof d === "object") {
            values = Object.values(d);
        } else {
            return "<error: unsupported input to output formatter>";
        }

        return values.map((v) => {
            let res;
            if (v instanceof Array) {
                res = "<Array>";
            } else if (typeof v === "object") {
                res = "<Object>";
            } else {
                res = v.toString();
            }

            return res;
        }).join("\n");
    },

    // eslint-disable-next-line valid-jsdoc
    /** Multi-line flat key value pairs
     * example output:
     * key1="val1",
     * a_0=0,
     * a_1=1,
     * a_length=2
     */
    flatKeyVal: (d) => {
        const flat = ObjSerialize.flatten(d, {
            annotateArrays: true
        });

        // Transform flat json object to one key=value per line.
        return Object.entries(flat).map((e) => `${e[0]}=${JSON.stringify(e[1])}`).join("\n");
    }
};

module.exports = {
    FORMATS: Object.keys(formatters),
    format: (data, format) => formatters[format](data)
};
