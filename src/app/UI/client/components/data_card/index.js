
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.DATA_CARD;
const exports = {
    CardList: require("./CardList"),
    TypeCard: require("./TypeCard"),
    RevisionCard: require("./RevisionCard"),
    JobCard: require("./JobCard"),
    SubJobCard: require("./SubJobCard"),
    CommentCard: require("./CommentCard"),
    ClaimCard: require("./ClaimCard"),
    AddCommentCard: require("./AddCommentCard"),
    ReviewCard: require("./ReviewCard"),
    ArtifactCard: require("./ArtifactCard"),
    LogCard: require("./LogCard"),
    StepResultCard: require("./StepResultCard"),
    CodeRepositoryCard: require("./CodeRepositoryCard"),
    ArtifactRepositoryCard: require("./ArtifactRepositoryCard"),
    UserCard: require("./UserCard"),
    TeamCard: require("./TeamCard"),
    UserPolicyCard: require("./UserPolicyCard"),
    StatSpecCard: require("./StatSpecCard"),
    StatStatCard: require("./StatStatCard"),
    StatStatInfoCard: require("./StatStatInfoCard"),
    StatChartCard: require("./StatChartCard"),
    LogRepositoryCard: require("./LogRepositoryCard"),
    SlaveCard: require("./SlaveCard"),
    FlowCard: require("./FlowCard"),
    BaselineSpecificationCard: require("./BaselineSpecificationCard"),
    BaselineCard: require("./BaselineCard"),
    CollectorCard: require("./CollectorCard")
};

module.exports = exporter(name, theme, exports);
