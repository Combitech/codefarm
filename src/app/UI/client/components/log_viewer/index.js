
import { themr } from "react-css-themr";
import { LOG_VIEWER } from "../identifiers.js";
import theme from "./theme.scss";

import LogViewer from "./LogViewer.js";
import LogLines from "./LogLines.js";

const ThemedLogViewer = themr(LOG_VIEWER, theme)(LogViewer);
const ThemedLogLines = themr(LOG_VIEWER, theme)(LogLines);

export default ThemedLogViewer;
export {
    ThemedLogViewer as LogViewer,
    ThemedLogLines as LogLines
};
