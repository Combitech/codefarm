
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.APP_INDEX;
const exports = {
    AppIndex: require("./AppIndex"),
    NotFoundPage: require("./NotFoundPage")
};

module.exports = exporter(name, theme, exports);
