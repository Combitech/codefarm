
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
            dispose: () => {
                this._disposeEventHandlers()
                .catch((error) => console.error(error));
            }
        });
    }

    async _load(opts) {
        await this._disposeEventHandlers();

        if (this.state.getValue() === ObservableDataStates.DISPOSED || !opts.id) {
            return this._initialValue;
        }

        const lines = await api.rest.action("logrepo.log", opts.id, "lines", {
            limit: opts.limit
        });

        if (opts.subscribe) {
            this.subscription = await api.log.subscribe(opts.id);

            this._evtSubs.push(api.log.on("line", (data) => {
                const opts = this._opts.getValue().toJS();
                const lastLine = this._value.getValue().last();

                if (lastLine && (lastLine.offset >= data.offset)) {
                    return;
                }

                let list = this._value.getValue().push(data.line);

                if (opts.limit) {
                    list = list.slice(-opts.limit);
                }

                this._value.next(list);
            }, { query: { id: opts.id }, id: `${opts.id}-${Date.now()}-${opts.limit}` }));
        }

        return lines;
    }

    async _disposeEventHandlers() {
        this._evtSubs.forEach(api.log.off);
        this._evtSubs = [];

        if (this.subscription) {
            await api.log.unsubscribe(this.subscription);
            this.subscription = null;
        }
    }
}

export default LogLines;
