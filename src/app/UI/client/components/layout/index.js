
import { themr } from "react-css-themr";
import { LAYOUT } from "../identifiers";
import theme from "./theme.scss";

import Column from "./Column";
import Row from "./Row";
import Header from "./Header";
import Section from "./Section";
import Container from "./Container";
import Loading from "./Loading";

const ThemedColumn = themr(LAYOUT, theme)(Column);
const ThemedRow = themr(LAYOUT, theme)(Row);
const ThemedHeader = themr(LAYOUT, theme)(Header);
const ThemedSection = themr(LAYOUT, theme)(Section);
const ThemedContainer = themr(LAYOUT, theme)(Container);
const ThemedLoading = themr(LAYOUT, theme)(Loading);

export { ThemedColumn as Column };
export { ThemedRow as Row };
export { ThemedHeader as Header };
export { ThemedSection as Section };
export { ThemedContainer as Container };
export { ThemedLoading as Loading };
