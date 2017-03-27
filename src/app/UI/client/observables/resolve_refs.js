
import TypeList from "ui-observables/type_list";
import { anyOf } from "ui-lib/query_builder";
import { ensureArray, flattenArray } from "misc";

class ResolveRefs extends TypeList {
    constructor(initialOpts) {
        if (typeof initialOpts.type !== "string") {
            throw new Error("type must be set to a string in the initial opts");
        }

        if (!(initialOpts.refs instanceof Array) && initialOpts.refs !== false) {
            throw new Error("refs must be set to an array in the initial opts");
        }

        const createQuery = (refs, type) => {
            if (!refs || refs.length === 0) {
                return false;
            }

            const ids = flattenArray(refs
                .filter((ref) => ref.type === type)
                .map((ref) => ensureArray(ref.id)));
            let query = false;
            if (ids.length > 0) {
                query = anyOf("_id", ids);
            }

            return query;
        };

        const defaultOpts = {
            type: initialOpts.type,
            query: createQuery(initialOpts.refs, initialOpts.type)
        };

        super(Object.assign({}, defaultOpts, initialOpts));

        this._createQuery = createQuery;
    }

    setOpts(opts) {
        const nextOpts = Object.assign({}, opts);

        if (opts.hasOwnProperty("refs") || opts.hasOwnProperty("type")) {
            const refs = opts.hasOwnProperty("refs") ? opts.refs : this.opts.getValue().toJS().refs;
            const type = opts.hasOwnProperty("type") ? opts.type : this.opts.getValue().toJS().type;
            nextOpts.query = this._createQuery(refs, type);
        }

        super.setOpts(nextOpts);
    }
}

export default ResolveRefs;
