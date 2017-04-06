
import PagedTypeList from "ui-observables/paged_type_list";

class FlowList extends PagedTypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "flowctrl.flow",
            sortOn: "name",
            sortOnType: "String",
            filter: "",
            filterFields: [ "_id", "description" ]
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);
    }
}

export default FlowList;
