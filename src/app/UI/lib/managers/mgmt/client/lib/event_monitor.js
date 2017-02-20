"use strict";

import api from "api.io/api.io-client";
import singleton from "singleton";

const DEFAULT_NOTIFY_LISTENERS_DELAY = 200;

class EventMonitor {
    constructor() {
        this.queuedEvents = [];
        this.listeners = [];
        this.started = false;
        this.deferredNotifyListeners = null;
    }

    _tryStart() {
        this.busEventSubscription = api.busMonitorApi.on("busEvent", this.notifyBusEvent.bind(this));
    }

    _tryStop() {
        if (this.busEventSubscription) {
            api.busMonitorApi.off(this.busEventSubscription);
            this.busEventSubscription = null;
        }
    }

    notifyBusEvent(event) {
        this.queuedEvents.push(event);
        this._notifyListeners();
    }

    _notifyListeners(delay = DEFAULT_NOTIFY_LISTENERS_DELAY) {
        const notify = () => {
            const queuedEvents = this.queuedEvents;
            for (const listener of this.listeners) {
                listener(queuedEvents);
            }
            this.queuedEvents.length = 0;
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

    addEventListener(listener) {
        this.listeners.push(listener);

        if (this.listeners.length > 0) {
            this._tryStart();
        }

        return {
            dispose: this.removeEventListener.bind(this, listener)
        };
    }

    removeEventListener(listener) {
        const indexToRemove = this.listeners.indexOf(listener);
        if (indexToRemove !== -1) {
            this.listeners.splice(indexToRemove, 1);
        }
        if (this.listeners.length === 0) {
            this._tryStop();
        }
    }

    dispose() {
        this._cancelNotifyListenersLater();
        this.queuedEvents.length = 0;
        this.tryStop();
    }
}

export default singleton(EventMonitor);
