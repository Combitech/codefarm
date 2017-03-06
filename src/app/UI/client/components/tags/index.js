
import { themr } from "react-css-themr";
import { TAGS } from "../identifiers";
import Tags from "./Tags";
import theme from "./theme.scss";

const ThemedTags = themr(TAGS, theme)(Tags);

export default ThemedTags;
export { ThemedTags as Tags };
