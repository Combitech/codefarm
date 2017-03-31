
import { themr } from "react-css-themr";
import { DATA_CHIP } from "../identifiers.js";
import theme from "./theme.scss";

import UserChip from "./UserChip.js";

const ThemedUserChip = themr(DATA_CHIP, theme)(UserChip);

export {
    ThemedUserChip as UserChip
};
