"use strict";

const Data = require("../types/data");
const { Controller } = require("typelib");

class Datas extends Controller {
    constructor() {
        super(Data, [ "read", "create" ]);
    }
}

module.exports = Datas;
