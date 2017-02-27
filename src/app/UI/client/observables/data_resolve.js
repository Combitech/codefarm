
import TypeItem from "ui-observables/type_item";
import api from "api.io/api.io-client";

class DataResolve extends TypeItem {
    constructor(initialOpts) {
        if (typeof initialOpts.resolver !== "string" && initialOpts.resolver !== false) {
            throw new Error("resolver must be set to a string or false in the initial opts");
        }

        if (typeof initialOpts.opts !== "undefined" && typeof initialOpts.opts !== "object") {
            throw new Error("opts must be an object");
        }

        const defaultOpts = {
            id: false,
            type: "dataresolve.data",
            opts: {}
        };

        super(Object.assign({}, defaultOpts, initialOpts));
    }

    async _load(opts) {
        if (!opts.resolver) {
            this._disposeEventHandlers();

            return this._initialValue;
        }

        const value = await api.rest.post(opts.type, {
            resolver: opts.resolver,
            opts: opts.opts
        });

        this._setupEventHandlers(Object.assign({}, opts, { id: value._id }));

        return value;
    }
}

export default DataResolve;
