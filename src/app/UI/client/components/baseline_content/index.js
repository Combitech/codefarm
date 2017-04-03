
import { themr } from "react-css-themr";
import { BASELINE_CONTENT } from "../identifiers";
import theme from "./theme.scss";

import BaselineContent from "./BaselineContent";

const ThemedBaselineContent = themr(BASELINE_CONTENT, theme)(BaselineContent);

export {
    ThemedBaselineContent as BaselineContent
};
