
/* diffymute.svg is relesed under Common Creative License.
 * source: https://groups.google.com/forum/#!msg/repo-discuss/nLCvwG2POpM/ENLsQX3ldugJ
 * Added viewBox to it to make it scale correctly when sized using CSS.
 */
import GerritDiffyIcon from "./diffymute.svg";
import CodeFarmIcon from "./ic_codefarm_black_48px.svg";
import IconStyler from "./IconStyler";

import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.APP_ICON;
const exports = {
    GitHubMarkerIcon: require("./GitHubMarkerIcon"),
    CodeRepoBackendIcon: require("./CodeRepoBackendIcon"),
    ArtifactRepoBackendIcon: require("./ArtifactRepoBackendIcon")
};

module.exports = Object.assign({
    IconStyler,
    CodeFarmIcon,
    GerritDiffyIcon
}, exporter(name, theme, exports));
