
import PagedTypeList from "ui-observables/paged_type_list";

class LogRepositoryList extends PagedTypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "logrepo.repository",
            query: {},
            sortDesc: true,
            filter: "",
            filterFields: [ "_id" ]
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);
    }
}

export default LogRepositoryList;
