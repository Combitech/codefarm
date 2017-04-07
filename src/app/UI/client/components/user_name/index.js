
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.USER_NAME;
const exports = [
    require("./UserName.js")
];

module.exports = exporter(name, theme, exports);
