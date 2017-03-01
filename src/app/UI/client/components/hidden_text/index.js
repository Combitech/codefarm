
import { themr } from "react-css-themr";
import { HIDDEN_TEXT } from "../identifiers.js";
import theme from "./theme.scss";

import HiddenText from "./HiddenText.js";

const ThemedHiddenText = themr(HIDDEN_TEXT, theme)(HiddenText);

export default ThemedHiddenText;
export {
    ThemedHiddenText as HiddenText
};
