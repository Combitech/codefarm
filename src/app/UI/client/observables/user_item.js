
import TypeList from "ui-observables/type_list";
import Immutable from "immutable";
import Rx from "rxjs";

class UserItem extends TypeList {
    constructor(initialOpts) {
        if (typeof initialOpts.email !== "string" && initialOpts.email !== false) {
            throw new Error("email must be set to a string or false in the initial opts");
        }

        const createQuery = (email) => (
            {
                email
            }
        );

        const defaultOpts = {
            type: "userrepo.user",
            query: createQuery(initialOpts.email)
        };

        super(Object.assign({}, defaultOpts, initialOpts));

        this._wrappedValue = new Rx.BehaviorSubject(Immutable.fromJS({}));
        this._createQuery = createQuery;
    }

    start() {
        this.addDisposable(this._value.subscribe((list) => {
            const value = list.count() > 0 ? list.first() : {};
            this._wrappedValue.next(Immutable.fromJS(value));
        }));

        super.start();
    }

    setOpts(opts) {
        const nextOpts = Object.assign({}, opts);

        if (opts.email) {
            nextOpts.query = this._createQuery(opts.email);
        }

        super.setOpts(nextOpts);
    }

    get value() {
        return this._wrappedValue;
    }
}

export default UserItem;
