
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.APP_TOP_BAR;
const exports = {
    AppTopBar: require("./AppTopBar")
};

module.exports = exporter(name, theme, exports);
