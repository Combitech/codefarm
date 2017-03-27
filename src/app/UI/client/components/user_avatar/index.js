
import { themr } from "react-css-themr";
import theme from "./theme.scss";
import { USER_AVATAR } from "../identifiers";

import UserAvatar from "./UserAvatar";
import TeamAvatar from "./TeamAvatar";

const ThemedUserAvatar = themr(USER_AVATAR, theme)(UserAvatar);
const ThemedTeamAvatar = themr(USER_AVATAR, theme)(TeamAvatar);

export default ThemedUserAvatar;
export { ThemedUserAvatar as UserAvatar };
export { ThemedTeamAvatar as TeamAvatar };
