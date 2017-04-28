
import utils from "./utils";

import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.TYPE_ADMIN;
const exports = {
    MenuItem: require("./MenuItem"),
    View: require("./View"),
    Edit: require("./Edit"),
    List: require("./List"),
    ListComponent: require("./ListComponent"),
    PagedList: require("./PagedList"),
    Remove: require("./Remove"),
    Form: require("./Form"),
    LoadIndicator: require("./LoadIndicator"),
    Section: require("./Section"),
    ListItemIcon: require("./ListItemIcon"),
    ListPager: require("./ListPager"),
    ListCards: require("./ListCards"),
    EditTags: require("./EditTags")
};

module.exports = Object.assign({
    utils
}, exporter(name, theme, exports));
