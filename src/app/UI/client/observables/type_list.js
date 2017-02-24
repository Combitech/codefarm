
import ObservableData from "ui-lib/observable_data";
import api from "api.io/api.io-client";

let idCounter = 0;

class TypeList extends ObservableData {
    constructor(initialOpts) {
        if (typeof initialOpts.type !== "string") {
            throw new Error("type must be set to a string in the initial opts");
        }

        if (typeof initialOpts.query !== "undefined" && typeof initialOpts.query !== "object") {
            throw new Error("query must be an object");
        }

        if (typeof initialOpts.subscribe !== "undefined" && typeof initialOpts.subscribe !== "boolean") {
            throw new Error("subscribe must be a boolean");
        }

        const defaultOpts = {
            query: {},
            subscribe: true
        };

        super(Object.assign({}, defaultOpts, initialOpts), []);

        this._evtSubs = [];
    }

    async _load(opts) {
        const value = await api.type.get(opts.type, opts.query);

        this._setupEventHandlers(opts);

        return value;
    }

    _addEventHandler(eventName, query, handlerFn) {
        const eventQuery = {
            id: `${idCounter++}-${eventName}`,
            query: query
        };

        this._evtSubs.push(api.type.on(eventName, handlerFn, eventQuery));
    }

    _setupEventHandlers(opts) {
        if (!opts.subscribe) {
            return;
        }

        this._disposeEventHandlers();

        this._addEventHandler(`created.${opts.type}`, {
            newdata: opts.query
        }, (data) => {
            this._value.next(this._value.getValue().push(data.newdata));
        });

        this._addEventHandler(`updated.${opts.type}`, {
            newdata: opts.query
        }, (data) => {
            const idx = this._value.getValue().findIndex((item) => item._id === data.newdata._id);

            if (idx !== -1) {
                this._value.next(this._value.getValue().push(data.newdata));
            } else {
                this._value.next(this._value.getValue().set(idx, data.newdata));
            }
        });

        this._addEventHandler(`updated.${opts.type}`, {
            olddata: opts.query,
            $not: { newdata: opts.query }
        }, (data) => {
            const idx = this._value.getValue().findIndex((item) => item._id === data.olddata._id);

            if (idx !== -1) {
                this._value.next(this._value.getValue().delete(idx));
            }
        });

        this._addEventHandler(`removed.${opts.type}`, {
            olddata: opts.query
        }, (data) => {
            const idx = this._value.getValue().findIndex((item) => item._id === data.olddata._id);

            if (idx !== -1) {
                this._value.next(this._value.getValue().delete(idx));
            }
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

export default TypeList;
