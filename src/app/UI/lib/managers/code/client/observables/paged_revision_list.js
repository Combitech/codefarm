
import PagedTypeList from "ui-observables/paged_type_list";

class RevisionList extends PagedTypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "coderepo.revision",
            sortOn: "statusSetAt",
            query: {},
            filter: "",
            filterFields: [ "name", "tags", "_id", "patches.email", "patches.name", "patches.comment", "patches.change.newrev" ]
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);
    }
}

export default RevisionList;
