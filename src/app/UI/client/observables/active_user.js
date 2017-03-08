
import Immutable from "immutable";
import Rx from "rxjs";
import singleton from "singleton";
import api from "api.io/api.io-client";

let instanceCounter = 0;

class ActiveUser {
    constructor(debug = true) {
        this.debug = debug;
        this.id = instanceCounter++;
        this._initialUser = {
            userLoggedIn: false
        };
        this._user = new Rx.BehaviorSubject(Immutable.fromJS(this._initialUser));
    }

    log(...args) {
        if (this.debug) {
            console.log(`${this.constructor.name}[${this.id}]`, ...args);
        }
    }

    logError(...args) {
        console.error(`${this.constructor.name}[${this.id}]`, ...args);
    }

    async start() {
        return this._sync();
    }

    get user() {
        return this._user;
    }

    setUser(user = false) {
        let nextUser = this._initialUser;
        if (user) {
            nextUser = Object.assign({
                userLoggedIn: true
            }, user);
        }
        if (JSON.stringify(this._user.getValue().toJS()) !== JSON.stringify(nextUser)) {
            console.log("Active user", nextUser);
            this._user.next(Immutable.fromJS(nextUser));
        }
    }

    /** Synchronize with server state
     * @return {undefined}
     */
    async _sync() {
        const response = await api.auth.whoami();
        if (response.success) {
            this.setUser(response.user);
        } else {
            console.log("Active user not set:", response.message);
        }
    }
}

export default singleton(ActiveUser);
