
import { themr } from "react-css-themr";
import { APP_MENU } from "../identifiers";
import AppMenu from "./AppMenu";
import theme from "./theme.scss";

const ThemedAppMenu = themr(APP_MENU, theme)(AppMenu);

export default ThemedAppMenu;
export { ThemedAppMenu as AppMenu };
