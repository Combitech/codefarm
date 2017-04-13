
import PagedTypeList from "ui-observables/paged_type_list";

class UserPolicyList extends PagedTypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "userrepo.policy",
            sortOn: "_id",
            sortOnType: "String",
            query: {},
            filter: "",
            filterFields: [ "_id", "privileges", "tags" ]
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);
    }
}

export default UserPolicyList;
