
import TypeList from "ui-observables/type_list";

class RevisionList extends TypeList {
    constructor(initialOpts) {
        const hasIds = initialOpts.hasOwnProperty("ids");
        const hasRepositoryId = initialOpts.hasOwnProperty("repositoryId");

        if (!hasIds && !hasRepositoryId) {
            throw new Error("ids must be set to an array in the initial opts or revision id set");
        }

        const createQuery = (opts) => {
            const query = {};

            if (opts.hasOwnProperty("ids")) {
                query._id = { $in: opts.ids };
            }

            if (opts.hasOwnProperty("repositoryId")) {
                query.repository = opts.repositoryId;
            }

            if (opts.hasOwnProperty("status")) {
                query.status = opts.status;
            }


            return query;
        };

        const defaultOpts = {
            type: "coderepo.revision",
            query: createQuery(initialOpts)
        };

        super(Object.assign({}, defaultOpts, initialOpts), true);

        this._createQuery = createQuery;
    }

    setOpts(opts) {
        const nextOpts = Object.assign({}, opts);

        if (opts.hasOwnProperty("ids") || opts.hasOwnProperty("repositoryId") || opts.hasOwnProperty("status")) {
            nextOpts.query = this._createQuery(opts);
        }

        super.setOpts(nextOpts);
    }
}

export default RevisionList;
