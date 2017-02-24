
import Immutable from "immutable";
import ObservableData from "ui-lib/observable_data";
import api from "api.io/api.io-client";

class TypeItem extends ObservableData {
    constructor(initialOpts) {
        if (typeof initialOpts.type !== "string") {
            throw new Error("type must be set to a string in the initial opts");
        }

        if (typeof initialOpts.id !== "string") {
            throw new Error("id must be set to a string in the initial opts");
        }

        if (typeof initialOpts.subscribe !== "undefined" && typeof initialOpts.subscribe !== "boolean") {
            throw new Error("subscribe must be a boolean");
        }

        const defaultOpts = {
            subscribe: true
        };

        super(Object.assign({}, defaultOpts, initialOpts), {});

        this._evtSubs = [];
    }

    async _load(opts) {
        if (!opts.id) {
            this._disposeEventHandlers();
            return this._initialValue;
        }
        
        const value = await api.type.get(opts.type, { _id: opts.id });

        this._setupEventHandlers(opts);

        return value[0] || this._initialValue;
    }

    _addEventHandler(eventName, handlerFn) {
        this._evtSubs.push(api.type.on(eventName, handlerFn));
    }

    _setupEventHandlers(opts) {
        if (!opts.subscribe) {
            return;
        }

        this._disposeEventHandlers();

        this._addEventHandler(`created.${opts.type}.${opts.id}`, (data) => {
            this._value.next(Immutable.fromJS(data.newdata));
        });
        
        this._addEventHandler(`updated.${opts.type}.${opts.id}`, (data) => {
            this._value.next(Immutable.fromJS(data.newdata));
        });
        
        this._addEventHandler(`removed.${opts.type}.${opts.id}`, (data) => {
            this._value.next(Immutable.fromJS(this._initialValue));
        });
    }

    _disposeEventHandlers() {
        this._evtSubs.forEach(api.type.off);
        this._evtSubs = [];
    }

    async _dispose() {
        this._disposeEventHandlers();
    }
}

export default TypeItem;
