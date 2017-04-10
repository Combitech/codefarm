
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.TAGS;
const exports = {
    Tags: require("./Tags")
};

module.exports = exporter(name, theme, exports);
