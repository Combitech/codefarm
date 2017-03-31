
import { themr } from "react-css-themr";
import { CHART } from "../identifiers";
import theme from "./theme.scss";

import Chart, { CHART_TYPE, AXIS_TYPE } from "./Chart";

const ThemedChart = themr(CHART, theme)(Chart);

export {
    ThemedChart as Chart,
    CHART_TYPE,
    AXIS_TYPE
};
