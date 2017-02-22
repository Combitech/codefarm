
import api from "api.io/api.io-client";
import loader from "ui-lib/loader";

class Type {
    constructor() {
        this.counter = 0;
        this.subscriptions = {};
    }

    _createSubscription(item, type, query, dataFn, pagingOpts = false) {
        const subscription = {
            id: this.counter++,
            dead: false,
            item: item,
            type: type,
            query: query,
            pagingOpts: pagingOpts,
            lastValue: null,
            lastError: null,
            dataFn: dataFn,
            apiEvents: [],
            loader: loader.create(),
            fetch: async () => {
                subscription.loader.set();

                try {
                    const data = await api.type.get(subscription.type, subscription.query);
                    if (!subscription.item && subscription.pagingOpts && subscription.pagingOpts.pageSize) {
                        const nextPageHasMoreData = data.length > subscription.pagingOpts.pageSize;
                        if (nextPageHasMoreData) {
                            // End not reached, truncate item
                            data.length = subscription.pagingOpts.pageSize;
                        }
                        if (subscription.pagingOpts.hasMoreDataCb) {
                            subscription.pagingOpts.hasMoreDataCb(nextPageHasMoreData);
                        }
                    }
                    subscription.setData(subscription.item ? data[0] : data);
                } catch (error) {
                    subscription.setError(error);
                    throw error;
                }
            },
            addEventHandler: (event, handlerFn, id, query) => {
                subscription.logInfo(`Added event handler for ${event} with query=${JSON.stringify(query)}`, api);
                let opts;
                if ((typeof id !== "undefined") && Object.keys(query || {}).length > 0) {
                    opts = {
                        id: id,
                        query: query
                    };
                }
                subscription.apiEvents.push(api.type.on(event, (data) => {
                    subscription.logInfo(`Got event ${event}`, data);
                    handlerFn(data);
                }, opts));
            },
            setData: (data) => {
                if (subscription.dead) {
                    return;
                }

                subscription.loader.unset();
                subscription.lastError = null;
                subscription.lastValue = data;
                subscription.logInfo("Got data", subscription.lastValue);
                subscription.dataFn(subscription.lastValue);
            },
            setError: (error) => {
                if (subscription.dead) {
                    return;
                }

                subscription.loader.unset();
                subscription.lastError = error;
                subscription.lastValue = subscription.item ? null : [];
                subscription.logError(error);
                subscription.dataFn(subscription.lastValue);
            },
            logInfo: (msg, ...args) => {
                console.log(`Subscription[${subscription.id}]: ${msg}`, ...args);
            },
            logError: (error) => {
                console.error(`Subscription[${subscription.id}]: Error`, error);
            },
            dispose: () => {
                for (const apiEvent of subscription.apiEvents) {
                    api.type.off(apiEvent);
                }

                subscription.dead = true;
                subscription.loader.dispose();

                delete this.subscriptions[subscription.id];
                subscription.logInfo(`Removed, now ${Object.keys(this.subscriptions).length} active subscriptions`);
            }
        };

        this.subscriptions[subscription.id] = subscription;
        subscription.logInfo(`Added, now ${Object.keys(this.subscriptions).length} active subscriptions`);

        return subscription;
    }

    async fetchItem(type, id) {
        let data = [];
        const indicator = loader.create();

        indicator.set();

        try {
            data = await api.type.get(type, { _id: id });
        } catch (error) {
            throw error;
        } finally {
            indicator.unset();
            indicator.dispose();
        }

        return data[0] || null;
    }

    async fetchList(type, query) {
        let data = [];
        const indicator = loader.create();

        indicator.set();

        try {
            data = await api.type.get(type, query);
        } catch (error) {
            throw error;
        } finally {
            indicator.unset();
            indicator.dispose();
        }

        return data;
    }

    async subscribeToItemAsync(...args) {
        const [ subscriptionId, promise ] = this._subscribeToItem(...args);

        await promise;

        return subscriptionId;
    }

    async subscribeToListAsync(...args) {
        const [ subscriptionId, promise ] = this._subscribeToList(...args);

        await promise;

        return subscriptionId;
    }

    subscribeToItem(...args) {
        const [ subscriptionId, promise ] = this._subscribeToItem(...args);

        promise.catch((error) => console.error(error));

        return subscriptionId;
    }

    subscribeToList(...args) {
        const [ subscriptionId, promise ] = this._subscribeToList(...args);

        promise.catch((error) => console.error(error));

        return subscriptionId;
    }

    _subscribeToItem(type, id, dataFn) {
        const subscription = this._createSubscription(true, type, { _id: id }, dataFn);
        subscription.logInfo(`Creating item subscription for id ${id}`);

        subscription.addEventHandler(`created.${type}.${id}`, (payload) => {
            if (subscription.dead) {
                return;
            }

            subscription.setData(payload.newdata);
        });

        subscription.addEventHandler(`updated.${type}.${id}`, (payload) => {
            if (subscription.dead) {
                return;
            }

            subscription.setData(payload.newdata);
        });

        subscription.addEventHandler(`removed.${type}.${id}`, () => {
            if (subscription.dead) {
                return;
            }

            subscription.setData(null);
        });

        subscription.logInfo("Subscription created", subscription);

        return [ subscription.id, subscription.fetch() ];
    }

    _subscribeToList(type, query, dataFn, pagingOpts = false) {
        const subscription = this._createSubscription(false, type, query, dataFn, pagingOpts);
        const isPaged = pagingOpts !== null && typeof pagingOpts === "object";

        subscription.logInfo(`Creating list subscription for query ${JSON.stringify(query)}`);

        const strippedQuery = Object.assign({}, subscription.query);
        Object.keys(strippedQuery)
            .filter((key) => key.startsWith("__"))
            .forEach((key) => delete strippedQuery[key]);

        const sortListFunc = (a, b) => {
            const aVal = a[pagingOpts.sortOn];
            const bVal = b[pagingOpts.sortOn];
            if (aVal < bVal) {
                return pagingOpts.sortDesc ? 1 : -1;
            } else if (aVal > bVal) {
                return pagingOpts.sortDesc ? -1 : 1;
            }

            return 0;
        };

        const addItemToList = (list, itemToAdd) => {
            if (isPaged && list.length > 0) {
                // Assume list is sorted, find insertion index
                const insertIdx = list.findIndex((item) => sortListFunc(item, itemToAdd) > 0);
                if (insertIdx >= 0 && insertIdx < list.length) {
                    list.splice(insertIdx, 0, itemToAdd);

                    // Truncate list if page overflow
                    if (list.length > pagingOpts.pageSize) {
                        const removeIdx = pagingOpts.sortDesc ? list.length - 1 : 0;
                        list.splice(removeIdx, 1);
                    }
                } else {
                    // Item doesn't belong to current page
                    return null;
                }
            } else {
                list.push(itemToAdd);
            }

            return list;
        };

        const replaceItemInList = (list, item, index) => {
            if (index === -1) {
                return list;
            }

            list[index] = item;
            if (isPaged) {
                list.sort(sortListFunc);
            }

            return list;
        };

        subscription.addEventHandler(`created.${type}`, (payload) => {
            if (subscription.dead) {
                return;
            }

            let list = subscription.lastValue ? subscription.lastValue.slice(0) : [];
            const data = payload.newdata;
            list = addItemToList(list, data);
            if (list) {
                subscription.setData(list);
            }
        }, subscription.id, { newdata: strippedQuery });

        subscription.addEventHandler(`updated.${type}`, (payload) => {
            if (subscription.dead) {
                return;
            }

            const data = payload.newdata;

            // If data matches query we must handle it
            if (data) {
                let list = subscription.lastValue ? subscription.lastValue.slice(0) : [];

                // If data already exists in our list replace it,
                // if it does not exist add it
                const index = subscription.lastValue.findIndex((item) => item._id === payload.newdata._id);
                if (index !== -1) {
                    list = replaceItemInList(list, data, index);
                } else {
                    list = addItemToList(list, data);
                }

                if (list) {
                    subscription.setData(list);
                }
            }
        }, subscription.id, { newdata: strippedQuery });

        subscription.addEventHandler(`updated.${type}`, (payload) => {
            if (subscription.dead) {
                return;
            }

            let index = -1;
            if (subscription.lastValue) {
                index = subscription.lastValue.findIndex((item) => item._id === payload.olddata._id);
            }

            // If data matches query we must handle it
            if (index !== -1) {
                const list = subscription.lastValue.slice(0);

                // Item exists in our list but no longer matches query,
                // we should remove it
                list.splice(index, 1);

                subscription.setData(list);
            }
        }, `${subscription.id}-update-remove`, {
            olddata: strippedQuery,
            $not: { newdata: strippedQuery }
        });

        subscription.addEventHandler(`removed.${type}`, (payload) => {
            if (subscription.dead) {
                return;
            }

            const data = payload.olddata;
            let index = -1;
            if (subscription.lastValue) {
                index = subscription.lastValue.findIndex((item) => item._id === data._id);
            }

            // If data matches our query and is in our list (it should be!),
            // we should remove it
            if (data && index !== -1) {
                const list = subscription.lastValue.slice(0);

                list.splice(index, 1);

                subscription.setData(list);
            }
        }, subscription.id, { olddata: strippedQuery });

        subscription.logInfo("Subscription created", subscription);

        return [ subscription.id, subscription.fetch() ];
    }

    unsubscribe(subscriptionId) {
        const subscription = this.subscriptions[subscriptionId];

        if (subscription) {
            subscription.logInfo("Unsubscribing...", subscription);
            subscription.dispose();
            subscription.logInfo("Unsubscribed", subscription);
        }
    }
}

export default new Type();
