
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.DATA_VIEW;
const exports = [
    require("./JobView"),
    require("./CodeRepositoryView"),
    require("./ArtifactRepositoryView"),
    require("./LogRepositoryView"),
    require("./SlaveView"),
    require("./FlowView"),
    require("./BaselineSpecificationView")
];

module.exports = exporter(name, theme, exports);
