
import Immutable from "immutable";
import Rx from "rxjs";
import singleton from "singleton";

let instanceCounter = 0;
const DEFAULT_MSG_TIMEOUT = 5000;

class Notification {
    constructor() {
        this.debug = false;
        this.id = instanceCounter++;
        this._latestMsg = new Rx.BehaviorSubject(Immutable.fromJS({}));
        this._messages = new Rx.BehaviorSubject(Immutable.fromJS([]));
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
        return this._latestMsg;
    }

    get messages() {
        return this._messages;
    }

    publish(msg, type = "accept", timeout = DEFAULT_MSG_TIMEOUT) {
        const nextMsg = { msg, type, timeout, timestamp: Date.now() };
        if (JSON.stringify(this._latestMsg.getValue().toJS()) !== JSON.stringify(nextMsg)) {
            console.log(`Notification published - ${nextMsg.type} - ${nextMsg.msg}`);
            const nextMsgImmutable = Immutable.fromJS(nextMsg);
            this._latestMsg.next(nextMsgImmutable);
            this._messages.next(this._messages.getValue().push(nextMsgImmutable));
        }
    }
}

export default singleton(Notification);
