
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.BREADCRUMBS;
const exports = {
    Breadcrumbs: require("./Breadcrumbs")
};

module.exports = exporter(name, theme, exports);
