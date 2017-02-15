"use strict";

const Thing = require("./thing");
const Controller = require("../../lib/controller");

class ThingController extends Controller {
    constructor() {
        super(Thing);

        this._addGetter("thingy", this._thingy);
    }

    async _thingy(id) {
        const obj = await this._getTypeInstance(id);

        return obj.thingy;
    }
}

module.exports = ThingController;
