
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.DATE_TIME;
const exports = [
    require("./DateTime")
];

module.exports = exporter(name, theme, exports);
