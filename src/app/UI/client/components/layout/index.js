
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.LAYOUT;
const exports = [
    require("./Column"),
    require("./Row"),
    require("./Header"),
    require("./Section"),
    require("./Container"),
    require("./Loading")
];

module.exports = exporter(name, theme, exports);
