"use strict";

import api from "api.io/api.io-client";
import RemoteService from "./remote_service";

const DEFAULT_NOTIFY_LISTENERS_DELAY = 200;

let instance;

class ServiceMonitor {
    constructor() {
        this.serviceInfo = {};
        this.listeners = [];
        this.deferredNotifyListeners = null;
        this.notifyStateEventSubscription = null;
    }

    static get instance() {
        if (!instance) {
            instance = new this();
        }

        return instance;
    }

    _tryStartServerSubscriptions() {
        if (!this.notifyStateEventSubscription) {
            this.notifyStateEventSubscription = api.mgmtApi.on(
                "stateEvent",
                this.notifyStateEvent.bind(this)
            );
        }
    }

    _tryStopServerSubscriptions() {
        if (this.notifyStateEventSubscription) {
            api.mgmtApi.off(this.notifyStateEventSubscription);
            this.notifyStateEventSubscription = null;

            // Empty service cache since no one is listening
            this._cancelNotifyListenersLater();
            this._resetServices();
        }
    }

    notifyStateEvent(event) {
        if (!(event.name in this.serviceInfo)) {
            // New service discovered
            this.serviceInfo[event.name] = new RemoteService(event.name);
        }
        const service = this.serviceInfo[event.name];
        service.update(event);
        this._notifyListeners();
    }

    _notifyListeners(delay = DEFAULT_NOTIFY_LISTENERS_DELAY) {
        const notify = () => {
            const services = this.services;
            for (const listener of this.listeners) {
                listener(services);
            }
            this.deferredNotifyListeners = null;
        };
        if (!delay) {
            notify();
        } else if (!this.deferredNotifyListeners) {
            this.deferredNotifyListeners = setTimeout(notify, delay);
        } // else timeout is pending and update will be done later
    }

    _cancelNotifyListenersLater() {
        if (!this.deferredNotifyListeners) {
            clearTimeout(this.deferredNotifyListeners);
            this.deferredNotifyListeners = null;
        }
    }

    get services() {
        const status = [];
        for (const id of Object.keys(this.serviceInfo)) {
            status.push(this.serviceInfo[id]);
        }

        return status;
    }

    addServiceInfoListener(listener) {
        this.listeners.push(listener);

        // Make sure that listener have the latest data
        listener(this.services);

        this._tryStartServerSubscriptions();

        return {
            dispose: this.removeServiceInfoListener.bind(this, listener)
        };
    }

    removeServiceInfoListener(listener) {
        const indexToRemove = this.listeners.indexOf(listener);
        if (indexToRemove !== -1) {
            this.listeners.splice(indexToRemove, 1);
        }

        // Stop subscription if no listeners
        if (this.listeners.length === 0) {
            this._tryStopServerSubscriptions();
        }
    }

    _resetServices() {
        for (const id of Object.keys(this.serviceInfo)) {
            this.serviceInfo[id].dispose();
            delete this.serviceInfo[id];
        }
    }

    dispose() {
        this._cancelNotifyListenersLater();
        this._resetServices();
    }
}

export default ServiceMonitor;
