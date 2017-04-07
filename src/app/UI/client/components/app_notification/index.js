
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.APP_NOTIFICATION;
const exports = [
    require("./AppNotification"),
    require("./AppNotificationsPage")
];

module.exports = exporter(name, theme, exports);
