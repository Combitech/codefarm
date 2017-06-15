
import { themr } from "react-css-themr";
import { PAGE_CODE } from "ui-components/identifiers";
import CodePage from "./Page";
import theme from "./theme.scss";

const ThemedCodePage = themr(PAGE_CODE, theme)(CodePage);

export default ThemedCodePage;
export { ThemedCodePage as CodePage };
