
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.LOG_VIEWER;
const exports = {
    LogViewer: require("./LogViewer"),
    LogLines: require("./LogLines")
};

module.exports = exporter(name, theme, exports);
