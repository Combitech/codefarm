
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.APP_HEADER;
const exports = {
    AppHeader: require("./AppHeader")
};

module.exports = exporter(name, theme, exports);
