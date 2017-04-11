
import PagedTypeList from "ui-observables/paged_type_list";

class UserList extends PagedTypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "userrepo.team",
            sortOn: "_id",
            sortOnType: "String",
            filter: "",
            filterFields: [ "_id", "name", "email" ]
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);
    }
}

export default UserList;
