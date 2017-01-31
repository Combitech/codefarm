
import { themr } from "react-css-themr";
import { CONFIRM_DIALOG } from "../identifiers";
import ConfirmDialog from "./ConfirmDialog";
import theme from "./theme.scss";

const ThemedConfirmDialog = themr(CONFIRM_DIALOG, theme)(ConfirmDialog);

export default ThemedConfirmDialog;
export { ThemedConfirmDialog as ConfirmDialog };
