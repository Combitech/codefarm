
import TypeList from "ui-observables/paged_type_list";

class SavedStats extends TypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "stat.stat",
            // Get all with non-empty chartConfigs[]
            // I.e. all documents which has a first element
            query: { "chartConfigs.0": { $exists: true } },
            subscribe: true
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);
    }
}

export default SavedStats;
