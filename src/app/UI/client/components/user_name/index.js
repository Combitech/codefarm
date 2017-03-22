
import { themr } from "react-css-themr";
import theme from "./theme.scss";
import { USER_NAME } from "../identifiers";

import UserName from "./UserName";

const ThemedUserName = themr(USER_NAME, theme)(UserName);

export default ThemedUserName;
export { ThemedUserName as UserName };
