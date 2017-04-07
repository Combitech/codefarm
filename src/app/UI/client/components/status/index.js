
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.STATUS;
const exports = [
    require("./StatusIcon")
];

module.exports = exporter(name, theme, exports);
