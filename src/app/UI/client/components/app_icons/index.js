import { themr } from "react-css-themr";
import { APP_ICON } from "../identifiers";
import theme from "./theme.scss";

import IconStyler from "./IconStyler";
import CodeFarmIcon from "./ic_codefarm_black_48px.svg";

/* diffymute.svg is relesed under Common Creative License.
 * source: https://groups.google.com/forum/#!msg/repo-discuss/nLCvwG2POpM/ENLsQX3ldugJ
 * Added viewBox to it to make it scale correctly when sized using CSS.
 */
import GerritDiffyIcon from "./diffymute.svg";

import GitHubMarkerIcon from "./GitHubMarkerIcon";
import RepoBackendIcon from "./RepoBackendIcon";

const ThemedGitHubMarkerIcon = themr(APP_ICON, theme)(GitHubMarkerIcon);
const ThemedRepoBackendIcon = themr(APP_ICON, theme)(RepoBackendIcon);

export {
    IconStyler,
    CodeFarmIcon,
    GerritDiffyIcon,
    ThemedGitHubMarkerIcon as GitHubMarkerIcon,
    ThemedRepoBackendIcon as RepoBackendIcon
};
