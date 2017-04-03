
import PagedTypeList from "ui-observables/paged_type_list";

const validateOpts = (opts, checkType) => {
    if (checkType && !opts.hasOwnProperty("type")) {
        throw new Error("type must be set in the initial opts");
    }

    if (!opts.hasOwnProperty("targetRef") && !opts.hasOwnProperty("creatorRef")) {
        throw new Error("targetRef or creatorRef must be set in the initial opts");
    }

    if (opts.hasOwnProperty("targetRef") && opts.hasOwnProperty("creatorRef")) {
        throw new Error("targetRef and creatorRef can not both be set in the initial opts");
    }
};

class MetaDataList extends PagedTypeList {
    constructor(initialOpts) {
        validateOpts(initialOpts, true);

        const createQuery = (targetRef, creatorRef) => {
            const query = {};

            if (targetRef) {
                query["targetRef.id"] = targetRef.id;
                query["targetRef.type"] = targetRef.type;
            }

            if (creatorRef) {
                query["creatorRef.id"] = creatorRef.id;
                query["creatorRef.type"] = creatorRef.type;
            }

            return query;
        };

        const defaultOpts = {
            query: createQuery(initialOpts.targetRef, initialOpts.creatorRef)
        };

        super(Object.assign({}, defaultOpts, initialOpts));

        this._createQuery = createQuery;
    }

    setOpts(opts) {
        const nextOpts = Object.assign({}, opts);

        if (opts.hasOwnProperty("targetRef") || opts.hasOwnProperty("creatorRef")) {
            validateOpts(opts, false);

            nextOpts.query = this._createQuery(opts.targetRef, opts.creatorRef);
        }

        super.setOpts(nextOpts);
    }
}

export default MetaDataList;
