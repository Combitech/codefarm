
import { themr } from "react-css-themr";
import { DATA_CARD } from "../identifiers";
import theme from "./theme.scss";

import CardList from "./CardList";
import RevisionCard from "./RevisionCard";
import JobCard from "./JobCard";
import SubJobCard from "./SubJobCard";
import CommentCard from "./CommentCard";
import AddCommentCard from "./AddCommentCard";
import ReviewCard from "./ReviewCard";
import ArtifactCard from "./ArtifactCard";
import LogCard from "./LogCard";
import StepResultCard from "./StepResultCard";

const ThemedCardList = themr(DATA_CARD, theme)(CardList);
const ThemedRevisionCard = themr(DATA_CARD, theme)(RevisionCard);
const ThemedJobCard = themr(DATA_CARD, theme)(JobCard);
const ThemedSubJobCard = themr(DATA_CARD, theme)(SubJobCard);
const ThemedCommentCard = themr(DATA_CARD, theme)(CommentCard);
const ThemedAddCommentCard = themr(DATA_CARD, theme)(AddCommentCard);
const ThemedReviewCard = themr(DATA_CARD, theme)(ReviewCard);
const ThemedArtifactCard = themr(DATA_CARD, theme)(ArtifactCard);
const ThemedLogCard = themr(DATA_CARD, theme)(LogCard);
const ThemedStepResultCard = themr(DATA_CARD, theme)(StepResultCard);

export { ThemedCardList as CardList };
export { ThemedRevisionCard as RevisionCard };
export { ThemedJobCard as JobCard };
export { ThemedSubJobCard as SubJobCard };
export { ThemedCommentCard as CommentCard };
export { ThemedAddCommentCard as AddCommentCard };
export { ThemedReviewCard as ReviewCard };
export { ThemedArtifactCard as ArtifactCard };
export { ThemedLogCard as LogCard };
export { ThemedStepResultCard as StepResultCard };
