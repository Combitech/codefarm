
import { themr } from "react-css-themr";
import { PAGE_USERS } from "ui-components/identifiers";
import UsersPage from "./Page";
import theme from "./theme.scss";

const ThemedUsersPage = themr(PAGE_USERS, theme)(UsersPage);

export default ThemedUsersPage;
export { ThemedUsersPage as UsersPage };
