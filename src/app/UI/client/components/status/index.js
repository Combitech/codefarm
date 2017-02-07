
import { themr } from "react-css-themr";
import { STATUS } from "../identifiers";
import StatusIcon from "./StatusIcon";
import theme from "./theme.scss";

const ThemedStatusIcon = themr(STATUS, theme)(StatusIcon);

export { ThemedStatusIcon as StatusIcon };
