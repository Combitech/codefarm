
import { themr } from "react-css-themr";
import { DATA_CHIP } from "../identifiers.js";
import theme from "./theme.scss";

import ChipList from "./ChipList.js";
import TypeChip from "./TypeChip.js";

const ThemedTypeChip = themr(DATA_CHIP, theme)(TypeChip);
const ThemedChipList = themr(DATA_CHIP, theme)(ChipList);

export {
    ThemedTypeChip as TypeChip,
    ThemedChipList as ChipList
};
