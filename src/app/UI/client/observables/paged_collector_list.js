
import PagedTypeList from "ui-observables/paged_type_list";

class CollectorList extends PagedTypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "baselinegen.collector",
            sortOn: "name",
            query: {},
            filter: "",
            filterFields: [ "name" ]
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);
    }
}

export default CollectorList;
