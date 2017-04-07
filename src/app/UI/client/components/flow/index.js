
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.FLOW;
const exports = [
    require("./Flows"),
    require("./Flow"),
    require("./JobFlow"),
    require("./steps/StepVirtual"),
    require("./steps/StepGeneric"),
    require("./steps/StepCreate"),
    require("./steps/StepStatus")
];

module.exports = exporter(name, theme, exports);
