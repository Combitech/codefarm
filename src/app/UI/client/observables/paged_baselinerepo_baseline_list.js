
import PagedTypeList from "ui-observables/paged_type_list";

class BaselineRepoBaselineList extends PagedTypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "baselinerepo.baseline",
            sortOn: "created",
            query: {},
            filter: "",
            filterFields: [ "name", "tags", "_id" ]
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);
    }
}

export default BaselineRepoBaselineList;
