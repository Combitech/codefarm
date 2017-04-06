
import PagedTypeList from "ui-observables/paged_type_list";

class SlaveList extends PagedTypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "exec.slave",
            sortOn: "_id",
            query: {},
            filter: "",
            filterFields: [ "_id", "uri", "tags" ]
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);
    }
}

export default SlaveList;
