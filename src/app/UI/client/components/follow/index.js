
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.FOLLOW;
const exports = [
    require("./Follow"),
    require("./List")
];

module.exports = exporter(name, theme, exports);
