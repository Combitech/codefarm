
import { themr } from "react-css-themr";
import { SVG_GRID } from "../identifiers";
import theme from "./theme.scss";

import SvgGrid from "./SvgGrid";
import SvgGridArrowMarkerDef from "./SvgGridArrowMarkerDef";
import SvgGridDefs from "./SvgGridDefs";
import SvgGridExample from "./SvgGridExample";
import SvgGridItem from "./SvgGridItem";
import SvgGridPath from "./SvgGridPath";
import sizes from "./sizes";
import filters from "./filters";

const ThemedSvgGrid = themr(SVG_GRID, theme)(SvgGrid);

export default ThemedSvgGrid;
export {
    ThemedSvgGrid as SvgGrid,
    SvgGridArrowMarkerDef,
    SvgGridDefs,
    SvgGridExample,
    SvgGridItem,
    SvgGridPath,
    sizes,
    filters
};
