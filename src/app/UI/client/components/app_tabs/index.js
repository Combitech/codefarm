
import { themr } from "react-css-themr";
import { APP_TABS } from "../identifiers";
import AppTabs from "./AppTabs";
import theme from "./theme.scss";

const ThemedAppTabs = themr(APP_TABS, theme)(AppTabs);

export default ThemedAppTabs;
export { ThemedAppTabs as AppTabs };
