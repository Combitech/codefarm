
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.APP_LAYOUT;
const exports = [
    require("./AppLayout")
];

module.exports = exporter(name, theme, exports);
