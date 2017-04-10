
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.APP_LOADER;
const exports = {
    AppLoader: require("./AppLoader")
};

module.exports = exporter(name, theme, exports);
