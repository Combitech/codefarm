
import PagedTypeList from "ui-observables/paged_type_list";

const convertOpts = (opts) => {
    const newOpts = Object.assign({}, opts);
    if (newOpts.hasOwnProperty("repositoryId") && newOpts.repositoryId !== null) {
        newOpts.query = Object.assign(newOpts.query || {}, {
            repository: newOpts.repositoryId
        });
        delete newOpts.repositoryId;
    }
    if (newOpts.hasOwnProperty("status") && newOpts.status !== null) {
        newOpts.query = Object.assign(newOpts.query || {}, {
            status: newOpts.status
        });
        delete newOpts.status;
    }

    return newOpts;
};

class RevisionList extends PagedTypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "coderepo.revision",
            query: false,
            repositoryId: null,
            filter: "",
            filterFields: [ "name", "tags", "_id", "patches.email", "patches.name", "patches.comment", "patches.change.newrev" ]
        };

        const opts = Object.assign({}, defaultOpts, initialOpts);
        super(convertOpts(opts), debug);
    }

    setOpts(opts) {
        super.setOpts(convertOpts(opts));
    }
}

export default RevisionList;
