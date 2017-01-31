
import { themr } from "react-css-themr";
import { BREADCRUMBS } from "../identifiers";
import Breadcrumbs from "./Breadcrumbs";
import theme from "./theme.scss";

const ThemedBreadcrumbs = themr(BREADCRUMBS, theme)(Breadcrumbs);

export default ThemedBreadcrumbs;
export { ThemedBreadcrumbs as Breadcrumbs };
