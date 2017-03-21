
import ObservableData, { States as ObservableDataStates } from "ui-lib/observable_data";
import api from "api.io/api.io-client";

class RepositoryUri extends ObservableData {
    constructor(initialOpts, debug = false) {
        super(initialOpts, "", debug);
    }

    async _load(opts) {
        if (this.state.getValue() === ObservableDataStates.DISPOSED || !opts.id) {
            return this._initialValue;
        }

        return await api.rest.get("coderepo.repository", opts.id, "uri");
    }
}

export default RepositoryUri;
