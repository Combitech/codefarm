
import { themr } from "react-css-themr";
import { LOG_VIEWER } from "../identifiers.js";
import theme from "./theme.scss";

import LogViewer from "./LogViewer.js";

const ThemedLogViewer = themr(LOG_VIEWER, theme)(LogViewer);

export default ThemedLogViewer;
export {
    ThemedLogViewer as LogViewer
};
