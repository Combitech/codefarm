
import TypeList from "ui-observables/type_list";

class CodeRepositories extends TypeList {
    constructor(initialOpts) {
        const defaultOpts = {
            type: "coderepo.repository"
        };

        super(Object.assign({}, defaultOpts, initialOpts));
    }
}

export default CodeRepositories;
