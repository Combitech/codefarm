
import { themr } from "react-css-themr";
import { DATA_VIEW } from "../identifiers";
import theme from "./theme.scss";

import JobView from "./JobView";

const ThemedJobView = themr(DATA_VIEW, theme)(JobView);

export {
    ThemedJobView as JobView
};
