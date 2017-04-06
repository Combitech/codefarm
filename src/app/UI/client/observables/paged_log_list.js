
import PagedTypeList from "ui-observables/paged_type_list";

class LogList extends PagedTypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "logrepo.log",
            sortOn: "created",
            query: {},
            filter: "",
            filterFields: [ "_id", "tags" ]
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);
    }
}

export default LogList;
