
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.DATA_VIEW;
const exports = {
    JobView: require("./JobView"),
    JobSpecView: require("./JobSpecView"),
    CodeRepositoryView: require("./CodeRepositoryView"),
    ArtifactRepositoryView: require("./ArtifactRepositoryView"),
    LogRepositoryView: require("./LogRepositoryView"),
    SlaveView: require("./SlaveView"),
    FlowView: require("./FlowView"),
    BaselineSpecificationView: require("./BaselineSpecificationView"),
    UserPolicyView: require("./UserPolicyView")
};

module.exports = exporter(name, theme, exports);
