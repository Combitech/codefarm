
import { themr } from "react-css-themr";
import { CLAIM } from "../identifiers.js";
import theme from "./theme.scss";

import Claim from "./Claim.js";

const ThemedClaim = themr(CLAIM, theme)(Claim);

export {
    ThemedClaim as Claim
};
