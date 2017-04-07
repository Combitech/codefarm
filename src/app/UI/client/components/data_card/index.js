
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.DATA_CARD;
const exports = [
    require("./CardList"),
    require("./TypeCard"),
    require("./RevisionCard"),
    require("./JobCard"),
    require("./SubJobCard"),
    require("./CommentCard"),
    require("./ClaimCard"),
    require("./AddCommentCard"),
    require("./ReviewCard"),
    require("./ArtifactCard"),
    require("./LogCard"),
    require("./StepResultCard"),
    require("./CodeRepositoryCard"),
    require("./ArtifactRepositoryCard"),
    require("./UserCard"),
    require("./TeamCard"),
    require("./PolicyCard"),
    require("./StatSpecCard"),
    require("./StatStatCard"),
    require("./StatStatInfoCard"),
    require("./StatChartCard"),
    require("./LogRepositoryCard"),
    require("./SlaveCard"),
    require("./FlowCard"),
    require("./BaselineSpecificationCard"),
    require("./BaselineCard"),
    require("./CollectorCard")
];

module.exports = exporter(name, theme, exports);
