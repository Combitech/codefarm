
import { themr } from "react-css-themr";
import { APP_LOADER } from "../identifiers.js";
import AppLoader from "./AppLoader.js";
import theme from "./theme.scss";

const ThemedAppLoader = themr(APP_LOADER, theme)(AppLoader);

export default ThemedAppLoader;
export { ThemedAppLoader as AppLoader };
