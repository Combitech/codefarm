
import PagedTypeList from "ui-observables/paged_type_list";

class BaselineList extends PagedTypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "baselinegen.baseline",
            sortOn: "created",
            query: {},
            filter: "",
            filterFields: [ "name" ]
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);
    }
}

export default BaselineList;
