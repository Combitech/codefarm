
import Immutable from "immutable";
import ObservableData, { States as ObservableDataStates } from "ui-lib/observable_data";
import api from "api.io/api.io-client";

class TypeItem extends ObservableData {
    constructor(initialOpts, debug = false) {
        if (typeof initialOpts.type !== "string") {
            throw new Error("type must be set to a string in the initial opts");
        }

        if (typeof initialOpts.id !== "string" && initialOpts.id !== false) {
            throw new Error("id must be set to a string or false in the initial opts");
        }

        if (typeof initialOpts.subscribe !== "undefined" && typeof initialOpts.subscribe !== "boolean") {
            throw new Error("subscribe must be a boolean");
        }

        const defaultOpts = {
            subscribe: true
        };

        super(Object.assign({}, defaultOpts, initialOpts), {}, debug);

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

        // First start listening to updates, then fetch initial data
        // TODO: Possible to miss updates in the following scenario:
        // - Type fetch reads serverside data
        // - Update happens
        // - Update rushes ahead of type fetch and triggers client subscription
        // - Client subscription updates this._value
        // - Async _fetch returns data which in turn does this._value.next() in parent class
        //   which overwrites data stored in this._value.
        this._setupEventHandlers(opts);
        const value = await api.type.get(opts.type, { _id: opts.id });

        return value[0] || this._initialValue;
    }

    _addEventHandler(eventName, handlerFn) {
        this._evtSubs.push(api.type.on(eventName, handlerFn));
    }

    _setupEventHandlers(opts) {
        if (this.state.getValue() === ObservableDataStates.DISPOSED || !opts.subscribe) {
            return;
        }

        this._disposeEventHandlers();

        this._addEventHandler(`created.${opts.type}.${opts.id}`, (data) => {
            this._value.next(Immutable.fromJS(data.newdata));
        });

        this._addEventHandler(`updated.${opts.type}.${opts.id}`, (data) => {
            this._value.next(Immutable.fromJS(data.newdata));
        });

        this._addEventHandler(`removed.${opts.type}.${opts.id}`, () => {
            this._value.next(Immutable.fromJS(this._initialValue));
        });
    }

    _disposeEventHandlers() {
        this._evtSubs.forEach(api.type.off);
        this._evtSubs = [];
    }
}

export default TypeItem;
