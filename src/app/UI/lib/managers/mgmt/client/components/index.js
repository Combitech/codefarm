
import { themr } from "react-css-themr";
import MgmtPage from "./Page";
import { PAGE_MGMT } from "ui-components/identifiers";
import theme from "./theme.scss";

const ThemedMgmtPage = themr(PAGE_MGMT, theme)(MgmtPage);

export default ThemedMgmtPage;
export { ThemedMgmtPage as MgmtPage };
