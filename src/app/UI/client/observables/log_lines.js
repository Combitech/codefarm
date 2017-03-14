
import Immutable from "immutable";
import ObservableData, { States as ObservableDataStates } from "ui-lib/observable_data";
import api from "api.io/api.io-client";

class LogLines extends ObservableData {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            id: false,
            limit: 0,
            subscribe: true
        };

        super(Object.assign({}, defaultOpts, initialOpts), [], debug);

        this._evtSubs = [];
        this.addDisposable({
            dispose: () => this._disposeEventHandlers()
        });
    }

    async _load(opts) {
        if (this.state.getValue() === ObservableDataStates.DISPOSED || !opts.id) {
            this._disposeEventHandlers();

            return this._initialValue;
        }

        const lines = await api.rest.action("logrepo.log", opts.id, "lines", {
            limit: opts.limit
        });

        this.subscription = await api.log.subscribe(opts.id);

        this._evtSubs.push(api.log.on("line", (data) => {
            let list = this._value.getValue().push(data.line);

            if (opts.limit) {
                list = list.slice(-opts.limit);
            }

            this._value.next(list);
        }, { query: { id: opts.id } }));

        return lines;
    }

    _disposeEventHandlers() {
        this._evtSubs.forEach(api.log.off);
        this._evtSubs = [];

        if (this.subscription) {
            api.log.unsubscribe(this.subscription).
            catch((error) => {
                console.error(error);
            });

            this.subscription = null;
        }
    }
}

export default LogLines;
