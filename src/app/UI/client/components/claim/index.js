
import { themr } from "react-css-themr";
import { CLAIM } from "../identifiers";
import theme from "./theme.scss";

import Claim from "./Claim";

const ThemedClaim = themr(CLAIM, theme)(Claim);

export {
    ThemedClaim as Claim
};
