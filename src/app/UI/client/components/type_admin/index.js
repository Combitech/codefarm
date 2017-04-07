
import utils from "./utils";

import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.TYPE_ADMIN;
const exports = [
    require("./ControlButton"),
    require("./View"),
    require("./Edit"),
    require("./List"),
    require("./ListComponent"),
    require("./PagedList"),
    require("./Remove"),
    require("./Form"),
    require("./LoadIndicator"),
    require("./Section"),
    require("./ListItemIcon"),
    require("./ListPager"),
    require("./ListCards"),
    require("./EditTags")
];

module.exports = Object.assign({
    utils
}, exporter(name, theme, exports));
