
import { themr } from "react-css-themr";
import { APP_HEADER } from "../identifiers";
import AppHeader from "./AppHeader";
import theme from "./theme.scss";

const ThemedAppHeader = themr(APP_HEADER, theme)(AppHeader);

export default ThemedAppHeader;
export { ThemedAppHeader as AppHeader };
