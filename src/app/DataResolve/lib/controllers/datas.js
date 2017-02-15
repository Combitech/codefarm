"use strict";

const Data = require("../types/data");
const { Controller } = require("servicecom");

class Datas extends Controller {
    constructor() {
        super(Data, [ "read", "create" ]);
    }
}

module.exports = Datas;
