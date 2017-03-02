
import { themr } from "react-css-themr";
import theme from "./theme.scss";
import { USER_AVATAR } from "../identifiers";

import UserAvatar from "./UserAvatar";

const ThemedUserAvatar = themr(USER_AVATAR, theme)(UserAvatar);

export default ThemedUserAvatar;
export { ThemedUserAvatar as UserAvatar };
