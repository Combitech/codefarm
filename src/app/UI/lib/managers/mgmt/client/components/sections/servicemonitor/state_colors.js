import * as colors from "ui-lib/colors.js";

const stateColors = {
    // Node states
    INVISIBLE: colors.black,
    NOT_CREATED: colors.grey600,
    CREATED: colors.grey600,
    CONNECTED: colors.yellow600,
    SETUP: colors.orange700,
    ONLINE: colors.green700,
    OFFLINE: colors.red700,
    EXIT: colors.grey600,

    // Link states
    INACTIVE: colors.grey600,
    UNSTABLE: colors.orange700,
    INITIATED: colors.yellow600,
    ALIVE: colors.green700
};

export default stateColors;
