
import PagedTypeList from "ui-observables/paged_type_list";

class BaselineSpecificationList extends PagedTypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "baselinegen.specification",
            query: {},
            sortDesc: true,
            filter: "",
            filterFields: [ "name" ]
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);
    }
}

export default BaselineSpecificationList;
