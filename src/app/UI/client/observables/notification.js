
import Immutable from "immutable";
import Rx from "rxjs";
import singleton from "singleton";

let instanceCounter = 0;
const DEFAULT_MSG_TIMEOUT = 5000;

class Notification {
    constructor() {
        this.debug = false;
        this.id = instanceCounter++;
        this._initialMsg = {};
        this._msg = new Rx.BehaviorSubject(Immutable.fromJS(this._initialMsg));
    }

    log(...args) {
        if (this.debug) {
            console.log(`${this.constructor.name}[${this.id}]`, ...args);
        }
    }

    logError(...args) {
        console.error(`${this.constructor.name}[${this.id}]`, ...args);
    }

    get msg() {
        return this._msg;
    }

    publish(msg, type = "accept", timeout = DEFAULT_MSG_TIMEOUT) {
        const nextMsg = { msg, type, timeout, timestamp: Date.now() };
        if (JSON.stringify(this._msg.getValue().toJS()) !== JSON.stringify(nextMsg)) {
            console.log(`Notification published - ${nextMsg.type} - ${nextMsg.msg}`);
            this._msg.next(Immutable.fromJS(nextMsg));
        }
    }
}

export default singleton(Notification);
