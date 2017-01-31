"use strict";

const jp = require("jsonpath-plus");

const engines = {
    jsonpath: (d, queryStr) => jp({ json: d, path: queryStr })
};

module.exports = {
    ENGINES: Object.keys(engines),
    query: (d, queryStr, engine) => engines[engine](d, queryStr)
};
