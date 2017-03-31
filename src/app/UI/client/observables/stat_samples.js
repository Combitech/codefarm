
import ObservableData, { States as ObservableDataStates } from "ui-lib/observable_data";
import api from "api.io/api.io-client";

class StatSamples extends ObservableData {
    constructor(initialOpts, debug = false) {
        if (!(initialOpts.fields instanceof Array) && initialOpts.fields !== false) {
            throw new Error("fields must be set to an array in the initial opts");
        }
        if (initialOpts.hasOwnProperty("first") && typeof initialOpts.first !== "number") {
            throw new Error("first must be set to a number in the initial opts if present");
        }
        if (initialOpts.hasOwnProperty("last") && typeof initialOpts.last !== "number") {
            throw new Error("last must be set to a number in the initial opts if present");
        }

        super(initialOpts, [], debug);
    }

    async _load(opts) {
        if (this.state.getValue() === ObservableDataStates.DISPOSED || !opts.id) {
            return this._initialValue;
        }

        const samplesOpts = {};
        // Copy properties from opts if specified
        [ "first", "last" ].forEach((prop) => {
            if (opts.hasOwnProperty(prop)) {
                samplesOpts[prop] = opts[prop];
            }
        });

        return await api.rest.get("stat.stat", opts.id, "samples", {
            fields: opts.fields || [],
            opts: samplesOpts
        });
    }
}

export default StatSamples;
