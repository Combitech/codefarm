
import { themr } from "react-css-themr";
import { EXPANDABLE_CARD } from "../identifiers";
import ExpandableCard from "./ExpandableCard";
import theme from "./theme.scss";

const ThemedExpandableCard = themr(EXPANDABLE_CARD, theme)(ExpandableCard);

export default ThemedExpandableCard;
export { ThemedExpandableCard as ExpandableCard };
