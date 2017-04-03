
import { themr } from "react-css-themr";
import { DATA_VIEW } from "../identifiers";
import theme from "./theme.scss";

import JobView from "./JobView";
import CodeRepositoryView from "./CodeRepositoryView";

const ThemedJobView = themr(DATA_VIEW, theme)(JobView);
const ThemedCodeRepositoryView = themr(DATA_VIEW, theme)(CodeRepositoryView);

export {
    ThemedJobView as JobView,
    ThemedCodeRepositoryView as CodeRepositoryView
};
