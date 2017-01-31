
import { themr } from "react-css-themr";
import { TYPE_TABLE } from "../identifiers";
import TypeTable from "./TypeTable";
import theme from "./theme.scss";

const ThemedTypeTable = themr(TYPE_TABLE, theme)(TypeTable);

export default ThemedTypeTable;
export { ThemedTypeTable as TypeTable };
