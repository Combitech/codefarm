
import PagedTypeList from "ui-observables/paged_type_list";

class UserList extends PagedTypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            type: "userrepo.user",
            filter: "",
            filterFields: [ "_id", "name", "email", "teams", "telephone" ]
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);
    }
}

export default UserList;
