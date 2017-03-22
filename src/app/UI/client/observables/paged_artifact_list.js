
import PagedTypeList from "ui-observables/paged_type_list";

class ArtifactList extends PagedTypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "artifactrepo.artifact",
            sortOn: "created",
            query: {},
            filter: "",
            filterFields: [ "name", "version", "state", "repository" ]
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);
    }
}

export default ArtifactList;
