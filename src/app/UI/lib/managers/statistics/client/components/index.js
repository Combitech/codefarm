
import { themr } from "react-css-themr";
import { PAGE_ARTIFACTS } from "ui-components/identifiers";
import ArtifactsPage from "./Page";
import theme from "./theme.scss";

const ThemedArtifactsPage = themr(PAGE_ARTIFACTS, theme)(ArtifactsPage);

export default ThemedArtifactsPage;
export { ThemedArtifactsPage as ArtifactsPage };
