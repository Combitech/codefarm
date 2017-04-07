
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.BASELINE_CONTENT;
const exports = [
    require("./BaselineContent")
];

module.exports = exporter(name, theme, exports);
