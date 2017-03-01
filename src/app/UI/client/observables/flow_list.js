
import TypeList from "ui-observables/type_list";
import * as queryBuilder from "ui-lib/query_builder";

class FlowList extends TypeList {
    constructor(initialOpts) {
        if (typeof initialOpts.tags !== "object" || initialOpts.tags.constructor !== Array) {
            throw new Error("tags must be set to an array in the initial opts");
        }

        const createQuery = (tags) => queryBuilder.anyOf("_id", tags
            .filter((tag) => tag.startsWith("step:flow:"))
            .map((tag) => tag.replace("step:flow:", "")));

        const defaultOpts = {
            type: "flowctrl.flow",
            query: createQuery(initialOpts.tags)
        };

        super(Object.assign({}, defaultOpts, initialOpts));

        this._createQuery = createQuery;
    }

    setOpts(opts) {
        const nextOpts = Object.assign({}, opts);

        if (opts.tags) {
            nextOpts.query = this._createQuery(opts.tags);
        }

        super.setOpts(nextOpts);
    }
}

export default FlowList;
