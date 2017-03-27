
import TypeList from "ui-observables/type_list";
import { anyOf } from "ui-lib/query_builder";
import { ensureArray, flattenArray } from "misc";

const COMMENT_TYPE = "metadata.comment";

class CommentList extends TypeList {
    constructor(initialOpts) {
        if (!(initialOpts.commentRefs instanceof Array) && initialOpts.commentRefs !== false) {
            throw new Error("commentRefs must be set to an arrayi n the initial opts");
        }

        const createQuery = (commentRefs) => {
            if (!commentRefs || commentRefs.length === 0) {
                return false;
            }

            const commentIds = flattenArray(commentRefs
                .filter((ref) => ref.type === COMMENT_TYPE)
                .map((ref) => ensureArray(ref.id)));
            let query = false;
            if (commentIds.length > 0) {
                query = anyOf("_id", commentIds);
            }

            return query;
        };

        const defaultOpts = {
            type: COMMENT_TYPE,
            query: createQuery(initialOpts.commentRefs)
        };

        delete initialOpts.commentRefs;

        super(Object.assign({}, defaultOpts, initialOpts));

        this._createQuery = createQuery;
    }

    setOpts(opts) {
        const nextOpts = Object.assign({}, opts);

        if (opts.hasOwnProperty("commentRefs")) {
            nextOpts.query = this._createQuery(opts.commentRefs);
        }

        delete nextOpts.commentRefs;

        super.setOpts(nextOpts);
    }
}

export default CommentList;
