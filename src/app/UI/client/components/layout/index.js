
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.LAYOUT;
const exports = {
    Column: require("./Column"),
    Row: require("./Row"),
    Header: require("./Header"),
    Section: require("./Section"),
    Container: require("./Container"),
    Loading: require("./Loading")
};

module.exports = exporter(name, theme, exports);
