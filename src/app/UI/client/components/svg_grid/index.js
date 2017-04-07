
import SvgGridArrowMarkerDef from "./SvgGridArrowMarkerDef";
import SvgGridDefs from "./SvgGridDefs";
import SvgGridExample from "./SvgGridExample";
import SvgGridItem from "./SvgGridItem";
import SvgGridPath from "./SvgGridPath";
import sizes from "./sizes";
import filters from "./filters";

import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.SVG_GRID;
const exports = [
    require("./SvgGrid")
];

module.exports = Object.assign({
    SvgGridArrowMarkerDef,
    SvgGridDefs,
    SvgGridExample,
    SvgGridItem,
    SvgGridPath,
    sizes,
    filters
}, exporter(name, theme, exports));
