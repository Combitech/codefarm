
import TypeList from "ui-observables/type_list";

class BaselineRepositories extends TypeList {
    constructor(initialOpts) {
        const defaultOpts = {
            type: "baselinerepo.repository"
        };

        super(Object.assign({}, defaultOpts, initialOpts));
    }
}

export default BaselineRepositories;
