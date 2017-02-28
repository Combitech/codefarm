
import Immutable from "immutable";
import Rx from "rxjs";

const States = {
    NOT_LOADING: "not loading",
    LOADING: "loading",
    DISPOSED: "disposed"
};

let instanceCounter = 0;

class ObservableData {
    constructor(initialOpts = {}, initialValue = false, debug = false) {
        this.debug = debug;
        this.id = instanceCounter++;
        this.disposables = [];

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

    log(...args) {
        if (this.debug) {
            console.log(`${this.constructor.name}[${this.id}]`, ...args);
        }
    }

    logError(...args) {
        console.error(`${this.constructor.name}[${this.id}]`, ...args);
    }

    addDisposable(disposable) {
        this.disposables.push(disposable);
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
        this.addDisposable(this._opts.subscribe((opts) => {
            if (this._state.getValue() === States.DISPOSED) {
                return;
            }
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
            const oldValue = this._value.getValue();
            this._load(opts.toJS())
            .then((value) => {
                if (this._state.getValue() === States.DISPOSED) {
                    return;
                }

                if (typeof value !== "undefined") {
                    if (oldValue !== this._value.getValue()) {
                        this.logError("_value updated during _load");
                    }
                    this._value.next(Immutable.fromJS(value));
                }

                this._state.next(States.NOT_LOADING);
            })
            .catch((error) => {
                opts.toJS().logerror && this.logError(error);
                this._error.next(Immutable.fromJS(error));
                this._value.next(Immutable.fromJS(this._initialValue));
                if (this._state.getValue() !== States.DISPOSED) {
                    this._state.next(States.NOT_LOADING);
                }
            });
        }));

        return this;
    }

    setOpts(opts) {
        /*
         * opts may contain only a subset of the available options
         * only values supplied in opts will be changed in the Internal
         * option state.
         */
        const nextOpts = {};
        const currOpts = this._opts.getValue().toJS();

        for (const key of Object.keys(opts)) {
            if (JSON.stringify(currOpts[key]) !== JSON.stringify(opts[key])) {
                nextOpts[key] = opts[key];
            }
        }

        if (Object.keys(nextOpts).length > 0) {
            this._opts.next(this._opts.getValue().merge(nextOpts));
        }
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

    dispose() {
        this.log(`dispose: disposables.length=${this.disposables.length}`);
        this._state.next(States.DISPOSED);
        for (const disposable of this.disposables) {
            disposable.unsubscribe && disposable.unsubscribe();
            disposable.dispose && disposable.dispose();
        }
        this.disposables = [];
    }
}

export default ObservableData;
export { States };
