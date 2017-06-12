
import PagedTypeList from "ui-observables/paged_type_list";

class JobList extends PagedTypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "exec.jobspec",
            sortOn: "created",
            query: {},
            sortDesc: true,
            filter: "",
            filterFields: [ "name", "criteria" ]
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);
    }
}

export default JobList;
