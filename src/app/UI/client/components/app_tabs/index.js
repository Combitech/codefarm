
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.APP_TABS;
const exports = {
    AppTabs: require("./AppTabs")
};

module.exports = exporter(name, theme, exports);
