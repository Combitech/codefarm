
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.FLOW;
const exports = {
    Flows: require("./Flows"),
    Flow: require("./Flow"),
    JobFlow: require("./JobFlow"),
    StepVirtual: require("./steps/StepVirtual"),
    StepGeneric: require("./steps/StepGeneric"),
    StepCreate: require("./steps/StepCreate"),
    StepStatus: require("./steps/StepStatus")
};

module.exports = exporter(name, theme, exports);
