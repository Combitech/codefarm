
import TypeList from "ui-observables/type_list";

const validateOpts = (opts) => {
    if (!opts.hasOwnProperty("targetRef") && !opts.hasOwnProperty("creatorRef")) {
        throw new Error("targetRef or creatorRef must be set in the initial opts");
    }

    if (opts.hasOwnProperty("targetRef") && opts.hasOwnProperty("creatorRef")) {
        throw new Error("targetRef and creatorRef can not both be set in the initial opts");
    }
};

class ClaimList extends TypeList {
    constructor(initialOpts) {
        validateOpts(initialOpts);

        const createQuery = (targetRef, creatorRef) => {
            const query = {};

            if (targetRef) {
                query.targetRef = {
                    _ref: true,
                    id: targetRef.id,
                    type: targetRef.type
                };
            }

            if (creatorRef) {
                query.creatorRef = {
                    _ref: true,
                    id: creatorRef.id,
                    type: creatorRef.type
                };
            }

            return query;
        };

        const defaultOpts = {
            type: "metadata.claim",
            query: createQuery(initialOpts.targetRef, initialOpts.creatorRef)
        };

        super(Object.assign([], defaultOpts, initialOpts));

        this._createQuery = createQuery;
    }

    setOpts(opts) {
        const nextOpts = Object.assign({}, opts);

        if (opts.hasOwnProperty("targetRef") || opts.hasOwnProperty("creatorRef")) {
            validateOpts(opts);

            nextOpts.query = this._createQuery(opts.targetRef, opts.creatorRef);
        }

        super.setOpts(nextOpts);
    }
}

export default ClaimList;
