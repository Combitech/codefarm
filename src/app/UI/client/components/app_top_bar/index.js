
import { themr } from "react-css-themr";
import { APP_TOP_BAR } from "../identifiers";
import AppTopBar from "./AppTopBar";
import theme from "./theme.scss";

const ThemedAppTopBar = themr(APP_TOP_BAR, theme)(AppTopBar);

export default ThemedAppTopBar;
export { ThemedAppTopBar as AppTopBar };
