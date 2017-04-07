
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.EXPANDABLE_CARD;
const exports = [
    require("./ExpandableCard")
];

module.exports = exporter(name, theme, exports);
