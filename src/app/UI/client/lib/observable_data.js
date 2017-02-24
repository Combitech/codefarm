
import Immutable from "immutable";
import Rx from "rxjs";

const States = {
    NOT_LOADING: "not loading",
    LOADING: "loading",
    DISPOSED: "disposed"
};

class ObservableData {
    constructor(initialOpts = {}, initialValue = false) {
        const defaultOpts = {
            logerror: true
        };

        /*
         * Store the initial values, some supplied by the subclass
         */
        this._initialOpts = Object.assign({}, defaultOpts, initialOpts);
        this._initialValue = initialValue;
        this._initialError = false;

        /*
         * Define observables and set their initial values
         */
        this._opts = new Rx.BehaviorSubject(Immutable.fromJS(this._initialOpts));
        this._value = new Rx.BehaviorSubject(Immutable.fromJS(this._initialValue));
        this._state = new Rx.BehaviorSubject(States.NOT_LOADING);
        this._error = new Rx.BehaviorSubject(Immutable.fromJS(this._initialError));
    }

    start() {
        /*
         * Subscribe to changes to props, a change should trigger a reload.
         * Resets the error before load and sets it again if the load fails.
         * If an error occurs the initial value will be set.
         * Updates the state as the loading is done.
         * If the loaded value is undefined the value will not be updated at all.
         * If a load completes and the states has become disposed during the load
         * ignore the result.
         */
        this.subscription = this._opts.subscribe((opts) => {
            this._state.next(States.LOADING);

            /*
             * If an error has been set previously it should be reset before
             * the load starts.
             */
            if (this._error.getValue()) {
                this._error.next(Immutable.fromJS(this._initialError));
            }

            /*
             * Call the load method, should be implemented by a subclass and
             * send in the options as a parameter.
             */
            this._load(opts.toJS())
            .then((value) => {
                if (this._state.getValue() === States.DISPOSED) {
                    return;
                }

                if (typeof value !== "undefined") {
                    this._value.next(Immutable.fromJS(value));
                }

                this._state.next(States.NOT_LOADING);
            })
            .catch((error) => {
                opts.toJS().logerror && console.error(error);
                this._error.next(Immutable.fromJS(error));
                this._value.next(Immutable.fromJS(this._initialValue));
                this._state.next(States.NOT_LOADING);
            });
        });

        return this;
    }

    setOpts(opts) {
        /*
         * opts may contain only a subset of the available options
         * only values supplied in opts will be changed in the Internal
         * option state
         */
        this._opts.next(this._opts.getValue().merge(opts));
    }

    get opts() {
        return this._opts;
    }

    get value() {
        return this._value;
    }

    get state() {
        return this._state;
    }

    get error() {
        return this._error;
    }

    async _load(opts) {
        throw new Error(`_load must be defined in the subclass, called with ${JSON.stringify(opts)}`);
    }

    async _dispose() {
    }

    dispose() {
        this.subscription.unsubscribe();

        this._dispose()
        .then(() => {
            this._state.next(States.DISPOSED);
        })
        .catch((error) => {
            this._opts.getValue().toJS().logerror && console.error(error);
            this._error.next(Immutable.fromJS(error));
            this._state.next(States.DISPOSED);
        });
    }
}

export default ObservableData;
export { States };
