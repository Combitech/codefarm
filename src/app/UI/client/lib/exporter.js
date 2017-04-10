
import { themr } from "react-css-themr";
import * as names from "ui-components/identifiers";

const exporter = (name, theme, components) => {
    const exports = {};
    const names = Object.keys(components);

    for (const name of names) {
        const component = components[name].default;

        exports[name] = themr(name, theme)(component);
        exports[name].default = exports[name];
    }

    return exports;
};

export {
    names,
    exporter
};
