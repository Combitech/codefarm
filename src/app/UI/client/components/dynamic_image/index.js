
import { themr } from "react-css-themr";
import { DYNAMIC_IMAGE } from "../identifiers";
import DynamicImage from "./DynamicImage";
import theme from "./theme.scss";

const ThemedDynamicImage = themr(DYNAMIC_IMAGE, theme)(DynamicImage);

export default ThemedDynamicImage;
export { ThemedDynamicImage as DynamicImage };
