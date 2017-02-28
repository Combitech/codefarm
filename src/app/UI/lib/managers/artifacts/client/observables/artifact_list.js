
import PagedTypeList from "ui-observables/paged_type_list";

const convertOpts = (opts) => {
    const newOpts = Object.assign({}, opts);
    if (newOpts.hasOwnProperty("repositoryId") && newOpts.repositoryId !== null) {
        newOpts.query = Object.assign(newOpts.query || {}, {
            repository: newOpts.repositoryId
        });
        delete newOpts.repositoryId;
    }

    return newOpts;
};

class ArtifactList extends PagedTypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "artifactrepo.artifact",
            query: false,
            repositoryId: null,
            filter: "",
            filterFields: [ "name", "version", "state", "repository" ]
        };

        const opts = Object.assign({}, defaultOpts, initialOpts);
        super(convertOpts(opts), debug);
    }

    setOpts(opts) {
        super.setOpts(convertOpts(opts));
    }
}

export default ArtifactList;
