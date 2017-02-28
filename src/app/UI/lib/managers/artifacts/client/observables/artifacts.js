
import PagedTypeList from "ui-observables/paged_type_list";

const convertOpts = (opts) => {
    const newOpts = Object.assign({}, opts);
    if (opts.hasOwnProperty("repositoryId") && opts.repositoryId !== null) {
        newOpts.query = Object.assign(newOpts.query || {}, {
            repository: opts.repositoryId
        });
        delete newOpts.repositoryId;
    }

    return newOpts;
};

class Artifacts extends PagedTypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "artifactrepo.artifact",
            query: false,
            sortDesc: true,
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

export default Artifacts;
