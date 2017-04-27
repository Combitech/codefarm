
import Immutable from "immutable";
import api from "api.io/api.io-client";
import ObservableData, { States as ObservableDataStates } from "ui-lib/observable_data";

class RecursiveItemList extends ObservableData {
    constructor(initialOpts) {
        super(initialOpts, []);

        this._evtSubs = {};
        this.addDisposable({
            dispose: () => this._disposeEventHandlers()
        });
    }

    _addEventHandler(eventName, query, handlerFn) {
        const eventQuery = {
            id: eventName,
            query: query
        };

        this._evtSubs[eventName] = api.type.on(eventName, handlerFn, eventQuery);
        this.log(`Added handler for event ${eventName}`, eventQuery);
    }

    _disposeEventHandler(eventName) {
        api.type.off(this._evtSubs[eventName]);
        delete this._evtSubs[eventName];
    }

    _disposeEventHandlers() {
        for (const eventName of Object.keys(this._evtSubs)) {
            this._disposeEventHandler(eventName);
        }

        this._evtSubs = {};
    }

    _getTree(inputList, ref) {
        const item = inputList
            .find((item) => item._id === ref.id && item.type === ref.type);

        let list = [];

        if (item) {
            list.push(item);

            for (const ref of item.derivatives) {
                list = list.concat(this._getTree(inputList, ref));
            }
        }

        return list;
    }

    _purge(ref) {
        const inputList = this.value.getValue().toJS();
        const removeList = this._getTree(inputList, ref);
        const list = inputList.filter((item) => !removeList.includes(item));

        this._disposeEventHandler(`updated.${ref.type}.${ref.id}`);
        this._disposeEventHandler(`removed.${ref.type}.${ref.id}`);

        return list;
    }

    async _fetch(ref) {
        if (this.state.getValue() === ObservableDataStates.DISPOSED) {
            this._disposeEventHandlers();

            return this._initialValue;
        }

        const items = await api.type.get(ref.type, { _id: ref.id });
        let list = [];

        for (const item of items) {
            const itemRef = { type: item.type, id: item._id };

            this._addEventHandler(`updated.${item.type}.${item._id}`, () => {
                const list = this._purge(itemRef);

                // TODO: Optimize this, if derivatives have not been updated
                // it will be enough to just replace the item in the list
                // with the data we got in the event, no need to fetch the
                // entire tree and reregister event handlers...

                this._fetch(itemRef)
                .then((items) => {
                    this._value.next(Immutable.fromJS(list.concat(items)));
                })
                .catch((error) => {
                    console.error(error);
                });
            });

            this._addEventHandler(`removed.${item.type}.${item._id}`, () => {
                const list = this._purge(itemRef);

                this._value.next(Immutable.fromJS(list));
            });

            list.push(item);

            for (const ref of item.derivatives) {
                list = list.concat(await this._fetch(ref));
            }
        }

        return list;
    }

    async _load(opts) {
        if (this.state.getValue() === ObservableDataStates.DISPOSED) {
            this._disposeEventHandlers();

            return this._initialValue;
        }

        const list = await this._fetch({ type: opts.type, id: opts.id });

        if (this.state.getValue() === ObservableDataStates.DISPOSED) {
            this._disposeEventHandlers();

            return this._initialValue;
        }

        return list;
    }
}

export default RecursiveItemList;
