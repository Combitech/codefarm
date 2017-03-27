
import ResolveRefs from "ui-observables/resolve_refs";

const COMMENT_TYPE = "metadata.comment";

class CommentList extends ResolveRefs {
    constructor(initialOpts) {
        if (!(initialOpts.commentRefs instanceof Array) && initialOpts.commentRefs !== false) {
            throw new Error("commentRefs must be set to an arrayi n the initial opts");
        }

        const defaultOpts = {
            type: COMMENT_TYPE,
            refs: initialOpts.commentRefs
        };

        delete initialOpts.commentRefs;

        super(Object.assign({}, defaultOpts, initialOpts));
    }

    setOpts(opts) {
        const nextOpts = Object.assign({}, opts);

        if (opts.hasOwnProperty("commentRefs")) {
            nextOpts.refs = opts.commentRefs;
        }

        delete nextOpts.commentRefs;

        super.setOpts(nextOpts);
    }
}

export default CommentList;
