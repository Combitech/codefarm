
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.APP_MENU;
const exports = [
    require("./AppMenu")
];

module.exports = exporter(name, theme, exports);
