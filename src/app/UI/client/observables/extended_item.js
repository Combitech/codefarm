
import DataResolve from "ui-observables/data_resolve";

const DEFAULT_PATHS = [ "$.refs[*]" ];

class ExtendedItem extends DataResolve {
    constructor(initialOpts) {
        if (typeof initialOpts.type !== "string") {
            throw new Error("type must be set to a string in the initial opts");
        }

        if (!(typeof initialOpts.id === "string" || initialOpts.id.constructor === Array) &&
            initialOpts.id !== false) {
            throw new Error("id must be set to a string or false in the initial opts");
        }

        if (initialOpts.hasOwnProperty("paths") && initialOpts.paths.constructor !== Array) {
            throw new Error("paths must be set to an array in the initial opts if present");
        }

        const createResolveOpts = (id, type, paths = false) => (
            {
                ref: {
                    id: id,
                    type: type
                },
                spec: {
                    paths: paths || DEFAULT_PATHS
                }
            }
        );

        const defaultOpts = {
            resolver: "RefResolve",
            opts: createResolveOpts(initialOpts.id, initialOpts.type, initialOpts.paths)
        };

        const opts = Object.assign({}, defaultOpts, initialOpts);

        delete opts.type;
        delete opts.id;
        delete opts.paths;

        super(opts);

        this._createResolveOpts = createResolveOpts;
    }

    setOpts(opts) {
        const nextOpts = Object.assign({}, opts);

        if (opts.id || opts.type || opts.paths) {
            delete nextOpts.id;
            delete nextOpts.type;
            delete nextOpts.paths;
            let paths = opts.paths;
            if (!paths) {
                // Use previous paths if not set now
                const prevOpts = super.opts.getValue().get("opts", {}).toJS();
                paths = prevOpts && prevOpts.spec && prevOpts.spec.paths;
            }

            nextOpts.opts = this._createResolveOpts(opts.id, opts.type, paths);
        }

        super.setOpts(nextOpts);
    }
}

export default ExtendedItem;
