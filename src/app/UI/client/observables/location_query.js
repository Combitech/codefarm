
/* global history document window Event */

import Immutable from "immutable";
import Rx from "rxjs";
import Url from "domurl";
import singleton from "singleton";

const wrap = function(type) {
    const original = history[type].bind(history);

    return (...args) => {
        const result = original(...args);
        const e = new Event(type.toLowerCase());
        e.arguments = args;
        window.dispatchEvent(e);

        return result;
    };
};

if (history && history.replaceState) {
    history.pushState = wrap("pushState");
    history.replaceState = wrap("replaceState");
}

class LocationQuery {
    constructor() {
        const url = new Url();

        this._params = new Rx.BehaviorSubject(Immutable.fromJS(Object.assign({}, url.query)));

        window.addEventListener("popstate", () => {
            this.onUpdate();
        });

        window.addEventListener("pushstate", () => {
            this.onUpdate();
        });

        window.addEventListener("replacestate", () => {
            this.onUpdate();
        });
    }

    get params() {
        return this._params;
    }

    onUpdate() {
        const url = new Url();
        const query = Object.assign({}, url.query);

        if (JSON.stringify(query) === JSON.stringify(this._params.getValue().toJS())) {
            return;
        }

        this._params.next(Immutable.fromJS(query));
    }

    setParams(params) {
        const url = new Url();

        for (const key of Object.keys(params)) {
            if (params[key] === null) {
                delete url.query[key];
            } else {
                url.query[key] = params[key];
            }
        }

        if (history && history.replaceState) {
            history.replaceState({}, "", url.toString());
        } else {
            document.location = url.toString();
        }
    }
}

export default singleton(LocationQuery);
