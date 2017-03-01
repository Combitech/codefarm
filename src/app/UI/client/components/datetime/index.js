
import { themr } from "react-css-themr";
import { DATE_TIME } from "../identifiers";
import DateTime from "./DateTime";
import theme from "./theme.scss";

const ThemedDateTime = themr(DATE_TIME, theme)(DateTime);

export default ThemedDateTime;
export { ThemedDateTime as DateTime };
