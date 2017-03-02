
import { themr } from "react-css-themr";
import { DATA_CARD } from "../identifiers";
import theme from "./theme.scss";

import RevisionCard from "./RevisionCard";
import JobCard from "./JobCard";

const ThemedRevisionCard = themr(DATA_CARD, theme)(RevisionCard);
const ThemedJobCard = themr(DATA_CARD, theme)(JobCard);

export { ThemedRevisionCard as RevisionCard };
export { ThemedJobCard as JobCard };
