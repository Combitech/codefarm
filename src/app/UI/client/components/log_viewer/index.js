
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.LOG_VIEWER;
const exports = [
    require("./LogViewer"),
    require("./LogLines")
];

module.exports = exporter(name, theme, exports);
