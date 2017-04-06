
import PagedTypeList from "ui-observables/paged_type_list";

class ArtifactRepositoryList extends PagedTypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "artifactrepo.repository",
            query: {},
            sortOn: "_id",
            sortDesc: true,
            filter: "",
            filterFields: [ "_id" ]
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);
    }
}

export default ArtifactRepositoryList;
