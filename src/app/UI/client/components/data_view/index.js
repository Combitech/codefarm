
import { themr } from "react-css-themr";
import { DATA_VIEW } from "../identifiers";
import theme from "./theme.scss";

import JobView from "./JobView";
import CodeRepositoryView from "./CodeRepositoryView";
import ArtifactRepositoryView from "./ArtifactRepositoryView";
import LogRepositoryView from "./LogRepositoryView";
import SlaveView from "./SlaveView";
import FlowView from "./FlowView";
import BaselineSpecificationView from "./BaselineSpecificationView";

const ThemedJobView = themr(DATA_VIEW, theme)(JobView);
const ThemedCodeRepositoryView = themr(DATA_VIEW, theme)(CodeRepositoryView);
const ThemedArtifactRepositoryView = themr(DATA_VIEW, theme)(ArtifactRepositoryView);
const ThemedLogRepositoryView = themr(DATA_VIEW, theme)(LogRepositoryView);
const ThemedSlaveView = themr(DATA_VIEW, theme)(SlaveView);
const ThemedFlowView = themr(DATA_VIEW, theme)(FlowView);
const ThemedBaselineSpecificationView = themr(DATA_VIEW, theme)(BaselineSpecificationView);

export {
    ThemedJobView as JobView,
    ThemedCodeRepositoryView as CodeRepositoryView,
    ThemedArtifactRepositoryView as ArtifactRepositoryView,
    ThemedLogRepositoryView as LogRepositoryView,
    ThemedSlaveView as SlaveView,
    ThemedFlowView as FlowView,
    ThemedBaselineSpecificationView as BaselineSpecificationView
};
