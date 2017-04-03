
import PagedTypeList from "ui-observables/paged_type_list";

class CodeRepositoryList extends PagedTypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "coderepo.repository",
            query: {},
            sortDesc: true,
            filter: "",
            filterFields: [ "name" ]
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);
    }
}

export default CodeRepositoryList;
