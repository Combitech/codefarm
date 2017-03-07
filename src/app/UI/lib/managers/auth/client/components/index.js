
import { themr } from "react-css-themr";
import AuthPage from "./Page";
import { PAGE_AUTH } from "ui-components/identifiers";
import theme from "./theme.scss";

const ThemedAuthPage = themr(PAGE_AUTH, theme)(AuthPage);

export default ThemedAuthPage;
export { ThemedAuthPage as AuthPage };
