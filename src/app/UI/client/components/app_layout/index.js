
import { themr } from "react-css-themr";
import { APP_LAYOUT } from "../identifiers";
import AppLayout from "./AppLayout";
import theme from "./theme.scss";

const ThemedAppLayout = themr(APP_LAYOUT, theme)(AppLayout);

export default ThemedAppLayout;
export { ThemedAppLayout as AppLayout };
