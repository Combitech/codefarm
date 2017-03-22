
import TypeList from "ui-observables/type_list";

class BaselineList extends TypeList {
    constructor(initialOpts) {
        if (typeof initialOpts.type !== "string") {
            throw new Error("type must be set to a string in the initial opts");
        }

        if (typeof initialOpts.id !== "string" && initialOpts.id !== false) {
            throw new Error("id must be set to a string or false in the initial opts");
        }

        const inOpts = Object.assign({}, initialOpts);
        delete inOpts.type;
        delete inOpts.id;

        const createQuery = (id, type) => (
            {
                "content.type": type,
                "content.id": id
            }
        );

        const defaultOpts = {
            type: "baselinegen.baseline",
            query: createQuery(initialOpts.id, initialOpts.type)
        };

        const opts = Object.assign({}, defaultOpts, inOpts);

        super(opts);

        this._createQuery = createQuery;
    }

    setOpts(opts) {
        const nextOpts = Object.assign({}, opts);

        if (opts.id || opts.type) {
            delete nextOpts.id;
            delete nextOpts.type;

            nextOpts.query = this._createQuery(opts.id, opts.type);
        }

        super.setOpts(nextOpts);
    }
}

export default BaselineList;
