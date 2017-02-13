
import { themr } from "react-css-themr";
import { FLOW, JOB_FLOW, FLOWS } from "../identifiers.js";
import theme from "./theme.scss";

import Flows from "./Flows.js";
import Flow from "./Flow.js";
import JobFlow from "./JobFlow.js";
import StepVirtual from "./steps/Virtual";
import StepGeneric from "./steps/Generic";
import StepCreate from "./steps/Create";
import StepStatus from "./steps/Status";

const ThemedFlows = themr(FLOWS, theme)(Flows);
const ThemedFlow = themr(FLOW, theme)(Flow);
const ThemedJobFlow = themr(JOB_FLOW, theme)(JobFlow);
const ThemedStepVirtual = themr(FLOW, theme)(StepVirtual);
const ThemedStepGeneric = themr(FLOW, theme)(StepGeneric);
const ThemedStepCreate = themr(FLOW, theme)(StepCreate);
const ThemedStepStatus = themr(FLOW, theme)(StepStatus);

export default ThemedFlow;
export {
    ThemedFlows as Flows,
    ThemedFlow as Flow,
    ThemedJobFlow as JobFlow,
    ThemedStepVirtual as StepVirtual,
    ThemedStepGeneric as StepGeneric,
    ThemedStepCreate as StepCreate,
    ThemedStepStatus as StepStatus
};
