
import { themr } from "react-css-themr";
import { APP_NOTIFICATION } from "../identifiers";
import AppNotification from "./AppNotification";
import theme from "./theme.scss";

const ThemedAppNotification = themr(APP_NOTIFICATION, theme)(AppNotification);

export default ThemedAppNotification;
export { ThemedAppNotification as AppNotification };
