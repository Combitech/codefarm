
import { themr } from "react-css-themr";
import { APP_NOTIFICATION } from "../identifiers";
import AppNotification from "./AppNotification";
import AppNotificationsPage from "./AppNotificationsPage";
import theme from "./theme.scss";

const ThemedAppNotification = themr(APP_NOTIFICATION, theme)(AppNotification);
const ThemedAppNotificationsPage = themr(APP_NOTIFICATION, theme)(AppNotificationsPage);

export default ThemedAppNotification;
export {
    ThemedAppNotification as AppNotification,
    ThemedAppNotificationsPage as AppNotificationsPage
};
