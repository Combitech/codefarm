
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.USER_AVATAR;
const exports = [
    require("./UserAvatar"),
    require("./TeamAvatar")
];

module.exports = exporter(name, theme, exports);
