
import { themr } from "react-css-themr";
import { PAGE_ADMINISTRATION } from "ui-components/identifiers";
import AdministrationPage from "./Page";
import theme from "./theme.scss";

const ThemedAdministrationPage = themr(PAGE_ADMINISTRATION, theme)(AdministrationPage);

export default ThemedAdministrationPage;
export { ThemedAdministrationPage as AdministrationPage };
