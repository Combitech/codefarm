
import { themr } from "react-css-themr";
import * as names from "ui-components/identifiers";

const exporter = (name, theme, components) => {
    const exports = {};

    for (const component of components) {
        const item = component.default;

        exports[item.name] = themr(name, theme)(item);
        exports[item.name].default = exports[item.name];
    }

    return exports;
};

export {
    names,
    exporter
};
