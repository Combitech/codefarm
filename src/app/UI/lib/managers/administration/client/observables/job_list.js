
import PagedTypeList from "ui-observables/paged_type_list";

class JobList extends PagedTypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "exec.job",
            query: {},
            sortDesc: true,
            filter: "",
            filterFields: [ "name", "status", "criteria" ]
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);
    }
}

export default JobList;
