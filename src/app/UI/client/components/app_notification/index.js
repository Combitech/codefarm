
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.APP_NOTIFICATION;
const exports = {
    AppNotification: require("./AppNotification"),
    AppNotificationsPage: require("./AppNotificationsPage")
};

module.exports = exporter(name, theme, exports);
