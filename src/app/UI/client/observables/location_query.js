
/* global history document */

import Immutable from "immutable";
import Rx from "rxjs";
import Url from "domurl";

class LocationQuery {
    constructor() {
        const url = new Url();

        this._params = new Rx.BehaviorSubject(Immutable.fromJS(Object.assign({}, url.query)));
    }

    get params() {
        return this._params;
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
            this._params.next(Immutable.fromJS(Object.assign({}, url.query)));
        } else {
            document.location = url.toString();
        }
    }
}

export default new LocationQuery();
