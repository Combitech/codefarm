
import { themr } from "react-css-themr";
import { COLLABORATOR_AVATAR } from "../identifiers";
import CollaboratorAvatar from "./CollaboratorAvatar";
import theme from "./theme.scss";

const ThemedCollaboratorAvatar = themr(COLLABORATOR_AVATAR, theme)(CollaboratorAvatar);

export default ThemedCollaboratorAvatar;
export { ThemedCollaboratorAvatar as CollaboratorAvatar };
