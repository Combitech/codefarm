
import { themr } from "react-css-themr";
import { FOLLOW } from "../identifiers.js";
import theme from "./theme.scss";

import Follow from "./Follow.js";
import List from "./List.js";

const ThemedFollow = themr(FOLLOW, theme)(Follow);
const ThemedList = themr(FOLLOW, theme)(List);

export {
    ThemedFollow as Follow,
    ThemedList as List
};
