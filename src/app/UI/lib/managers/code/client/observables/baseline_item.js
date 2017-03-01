
import DataResolve from "ui-observables/data_resolve";

class BaselineItem extends DataResolve {
    constructor(initialOpts) {
        if (typeof initialOpts.id !== "string" && initialOpts.id !== false) {
            throw new Error("id must be set to a string or false in the initial opts");
        }

        const createResolveOpts = (id) => (
            {
                ref: {
                    id: id,
                    type: "baselinegen.baseline"
                },
                spec: {
                    paths: [
                        "$.content[*]"
                    ]
                }
            }
        );

        const defaultOpts = {
            resolver: "RefResolve",
            opts: createResolveOpts(initialOpts.id)
        };

        const opts = Object.assign({}, defaultOpts, initialOpts);

        delete opts.id;

        super(opts);

        this._createResolveOpts = createResolveOpts;
    }

    setOpts(opts) {
        const nextOpts = Object.assign({}, opts);

        if (opts.id) {
            delete nextOpts.id;

            nextOpts.opts = this._createResolveOpts(opts.id);
        }

        super.setOpts(nextOpts);
    }
}

export default BaselineItem;
