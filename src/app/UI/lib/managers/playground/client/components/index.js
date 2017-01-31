
import { themr } from "react-css-themr";
import { PAGE_PLAYGROUND } from "ui-components/identifiers";
import PlaygroundPage from "./Page";
import theme from "./theme.scss";

const ThemedPlaygroundPage = themr(PAGE_PLAYGROUND, theme)(PlaygroundPage);

export default ThemedPlaygroundPage;
export { ThemedPlaygroundPage as PlaygroundPage };
