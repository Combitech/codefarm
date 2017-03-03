
import TypeList from "ui-observables/type_list";

class SubJobList extends TypeList {
    constructor(initialOpts) {
        if (typeof initialOpts.ids !== "object" || initialOpts.ids.constructor !== Array) {
            throw new Error("ids must be set to an array in the initial opts");
        }

        const createQuery = (ids) => (
            {
                _id: { $in: ids }
            }
        );

        const defaultOpts = {
            type: "exec.subjob",
            query: createQuery(initialOpts.ids)
        };

        super(Object.assign({}, defaultOpts, initialOpts));

        this._createQuery = createQuery;
    }

    setOpts(opts) {
        const nextOpts = Object.assign({}, opts);

        if (opts.ids) {
            nextOpts.query = this._createQuery(opts.ids);
        }

        super.setOpts(nextOpts);
    }
}

export default SubJobList;
