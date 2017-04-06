
import { themr } from "react-css-themr";
import { DATA_VIEW } from "../identifiers";
import theme from "./theme.scss";

import JobView from "./JobView";
import CodeRepositoryView from "./CodeRepositoryView";
import ArtifactRepositoryView from "./ArtifactRepositoryView";

const ThemedJobView = themr(DATA_VIEW, theme)(JobView);
const ThemedCodeRepositoryView = themr(DATA_VIEW, theme)(CodeRepositoryView);
const ThemedArtifactRepositoryView = themr(DATA_VIEW, theme)(ArtifactRepositoryView);

export {
    ThemedJobView as JobView,
    ThemedCodeRepositoryView as CodeRepositoryView,
    ThemedArtifactRepositoryView as ArtifactRepositoryView
};
