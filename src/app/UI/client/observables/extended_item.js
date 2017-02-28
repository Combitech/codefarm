
import DataResolve from "ui-observables/data_resolve";

class ExtendedItem extends DataResolve {
    constructor(initialOpts) {
        if (typeof initialOpts.type !== "string") {
            throw new Error("type must be set to a string in the initial opts");
        }

        if (typeof initialOpts.id !== "string" && initialOpts.id !== false) {
            throw new Error("id must be set to a string or false in the initial opts");
        }

        const createResolveOpts = (id, type) => (
            {
                ref: {
                    id: id,
                    type: type
                },
                spec: {
                    paths: [
                        "$.refs[*]"
                    ]
                }
            }
        );

        const defaultOpts = {
            resolver: "RefResolve",
            opts: createResolveOpts(initialOpts.id, initialOpts.type)
        };

        const opts = Object.assign({}, defaultOpts, initialOpts);

        delete opts.type;
        delete opts.id;

        super(opts);

        this._createResolveOpts = createResolveOpts;
    }

    setOpts(opts) {
        const nextOpts = Object.assign({}, opts);

        if (opts.id || opts.type) {
            delete nextOpts.id;
            delete nextOpts.type;

            nextOpts.opts = this._createResolveOpts(opts.id, opts.type);
        }

        super.setOpts(nextOpts);
    }
}

export default ExtendedItem;
