
import { themr } from "react-css-themr";
import theme from "./theme.scss";
import { APP_PAGER } from "../identifiers";

import AppPager from "./AppPager";

const ThemedAppPager = themr(APP_PAGER, theme)(AppPager);

export default ThemedAppPager;
export { ThemedAppPager as AppPager };
