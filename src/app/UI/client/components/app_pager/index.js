
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.APP_PAGER;
const exports = {
    AppPager: require("./AppPager")
};

module.exports = exporter(name, theme, exports);
