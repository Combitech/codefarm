
import Rx from "rxjs";
import Immutable from "immutable";
import ObservableData, { States as ObservableDataStates } from "ui-lib/observable_data";
import api from "api.io/api.io-client";
import { isNumeric } from "misc";
import { filterFields as qbFilterFields } from "ui-lib/query_builder";

let idCounter = 0;

class TypeList extends ObservableData {
    constructor(initialOpts, debug = false) {
        if (typeof initialOpts.type !== "string") {
            throw new Error("type must be set to a string in the initial opts");
        }

        // Allow query object or false to load no initial data
        if (initialOpts.query !== false &&
            typeof initialOpts.query !== "undefined" &&
            typeof initialOpts.query !== "object") {
            throw new Error("query must be an object or false");
        }

        if (typeof initialOpts.subscribe !== "undefined" && typeof initialOpts.subscribe !== "boolean") {
            throw new Error("subscribe must be a boolean");
        }

        if (initialOpts.hasOwnProperty("sortOn") && typeof initialOpts.sortOn !== "string") {
            throw new Error("sortOn must be set to a string in the initial opts");
        }

        if (initialOpts.hasOwnProperty("sortDesc") && typeof initialOpts.sortDesc !== "boolean") {
            throw new Error("sortDesc must be set to a boolean in the initial opts");
        }

        if (initialOpts.hasOwnProperty("limit") && typeof initialOpts.limit !== "number") {
            throw new Error("limit must be set to a number in the initial opts");
        }

        if (initialOpts.hasOwnProperty("filter") && typeof initialOpts.filter !== "string") {
            throw new Error("filter must be set to a string in the initial opts");
        }

        if (initialOpts.hasOwnProperty("trackMoreData") && typeof initialOpts.trackMoreData !== "boolean") {
            throw new Error("limit must be set to a number in the initial opts");
        }

        const defaultOpts = {
            query: {},
            subscribe: true,
            sortOn: "created",
            sortDesc: true,
            limit: false,
            filter: "",
            filterFields: [],
            trackMoreData: false
        };

        super(Object.assign({}, defaultOpts, initialOpts), [], debug);
        this._hasMoreData = new Rx.BehaviorSubject(false);

        this._evtSubs = [];
        this.addDisposable({
            dispose: () => this._disposeEventHandlers()
        });
    }

    get hasMoreData() {
        return this._hasMoreData;
    }

    _buildQuery(opts) {
        const query = Object.assign({}, opts.query);
        query.__options = Object.assign({}, query.__options, {
            sort: {
                [ opts.sortOn ]: opts.sortDesc ? -1 : 1
            }
        });
        if (isNumeric(opts.limit)) {
            query.__options = Object.assign({}, query.__options, {
                limit: opts.limit
            });
        }

        if (opts.filterFields.length > 0 && opts.filter && opts.filter.length > 0) {
            Object.assign(query, qbFilterFields(opts.filterFields, opts.filter, "si"));
        }

        this.log("_buildQuery", query);

        return query;
    }

    async _fetch(opts, query) {
        // Fetch one more item if trackMoreData
        const trackMoreData = isNumeric(opts.limit) && opts.trackMoreData;
        if (trackMoreData) {
            query.__options = Object.assign({}, query.__options, {
                limit: opts.limit + 1
            });
        }

        const list = await api.type.get(opts.type, query);
        if (trackMoreData) {
            let hasMoreData = false;
            if (list.length > opts.limit) {
                hasMoreData = true;
                // Since we fetched one item too much, remove it
                list.length = opts.limit;
            }
            if (this._hasMoreData.getValue() !== hasMoreData) {
                this._hasMoreData.next(hasMoreData);
            }
        }

        return list;
    }

    async _load(opts) {
        if (this.state.getValue() === ObservableDataStates.DISPOSED || !opts.query) {
            this._disposeEventHandlers();

            return this._initialValue;
        }

        const query = this._buildQuery(opts);
        const value = await this._fetch(opts, query);

        const strippedQuery = Object.assign({}, query);
        Object.keys(strippedQuery)
            .filter((key) => key.startsWith("__"))
            .forEach((key) => delete strippedQuery[key]);

        this._setupEventHandlers(opts, strippedQuery);

        return value;
    }

    _addEventHandler(eventName, query, handlerFn) {
        const eventQuery = {
            id: `${idCounter++}-${eventName}`,
            query: query
        };

        this._evtSubs.push(api.type.on(eventName, handlerFn, eventQuery));
    }

    _setupEventHandlers(opts, query) {
        if (this.state.getValue() === ObservableDataStates.DISPOSED || !opts.subscribe) {
            return;
        }

        this._disposeEventHandlers();

        // We need to sort on updated and added items
        const sortListFunc = (a, b) => {
            const aVal = a.get(opts.sortOn);
            const bVal = b.get(opts.sortOn);
            if (aVal < bVal) {
                return opts.sortDesc ? 1 : -1;
            } else if (aVal > bVal) {
                return opts.sortDesc ? -1 : 1;
            }

            return 0;
        };

        const addItemToList = (list, itemToAdd) => {
            if (isNumeric(opts.limit) && list.size > 0) {
                // Assume list is sorted, find insertion index
                const insertIdx = list.findIndex((item) => sortListFunc(item, itemToAdd) > 0);
                if (insertIdx >= 0 && insertIdx < list.size) {
                    list = list.splice(insertIdx, 0, itemToAdd);

                    // Truncate list if overflow
                    if (list.size > opts.limit) {
                        const removeIdx = opts.sortDesc ? list.size - 1 : 0;
                        list = list.splice(removeIdx, 1);
                    }
                } else {
                    // Item doesn't belong to current page
                    return null;
                }
            } else {
                list = list.push(itemToAdd);
            }

            return list;
        };

        const replaceItemInList = (list, item, index) => {
            if (index === -1) {
                return list;
            }

            list = list.set(index, item);
            if (opts.sortOn) {
                list = list.sort(sortListFunc);
            }

            return list;
        };

        this._addEventHandler(`created.${opts.type}`, {
            newdata: query
        }, (data) => {
            const item = Immutable.fromJS(data.newdata);
            const list = addItemToList(this._value.getValue(), item);
            if (list) {
                this.log(`created.${opts.type} - added _id: ${data.newdata._id}`);
                this._value.next(list);
            }
        });

        this._addEventHandler(`updated.${opts.type}`, {
            newdata: query
        }, (data) => {
            const idx = this._value.getValue().findIndex((item) => item.get("_id") === data.newdata._id);

            let list;
            const item = Immutable.fromJS(data.newdata);
            if (idx !== -1) {
                list = replaceItemInList(this._value.getValue(), item, idx);
            } else {
                list = addItemToList(this._value.getValue(), item);
            }
            if (list) {
                const opStr = idx !== -1 ? "replaced" : "added";
                this.log(`updated.${opts.type} - ${opStr} _id: ${data.newdata._id}`);
                this._value.next(list);
            }
        });

        this._addEventHandler(`updated.${opts.type}`, {
            olddata: query,
            $not: { newdata: query }
        }, (data) => {
            const idx = this._value.getValue().findIndex((item) => item.get("_id") === data.olddata._id);

            if (idx !== -1) {
                this.log(`updated.${opts.type} - removed _id: ${data.olddata._id}`);
                this._value.next(this._value.getValue().delete(idx));
            }
        });

        this._addEventHandler(`removed.${opts.type}`, {
            olddata: query
        }, (data) => {
            const idx = this._value.getValue().findIndex((item) => item.get("_id") === data.olddata._id);

            if (idx !== -1) {
                this.log(`removed.${opts.type} - removed _id: ${data.olddata._id}`);
                this._value.next(this._value.getValue().delete(idx));
            }
        });
    }

    _disposeEventHandlers() {
        this._evtSubs.forEach(api.type.off);
        this._evtSubs = [];
    }
}

export default TypeList;
