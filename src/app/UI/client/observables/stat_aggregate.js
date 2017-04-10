
import ObservableData, { States as ObservableDataStates } from "ui-lib/observable_data";
import api from "api.io/api.io-client";

class StatAggregate extends ObservableData {
    constructor(initialOpts, debug = false) {
        if (!(initialOpts.pipeline instanceof Array) && initialOpts.pipeline !== false) {
            throw new Error("pipeline must be set to an array in the initial opts");
        }

        super(initialOpts, [], debug);
    }

    async _load(opts) {
        if (this.state.getValue() === ObservableDataStates.DISPOSED || !opts.pipeline || !opts.id) {
            return this._initialValue;
        }

        return await api.rest.get("stat.stat", opts.id, "aggregate", {
            pipeline: opts.pipeline
        });
    }
}

export default StatAggregate;
