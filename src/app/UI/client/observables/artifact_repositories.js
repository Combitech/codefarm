
import TypeList from "ui-observables/type_list";

class ArtifactRepositories extends TypeList {
    constructor(initialOpts) {
        const defaultOpts = {
            type: "artifactrepo.repository"
        };

        super(Object.assign({}, defaultOpts, initialOpts));
    }
}

export default ArtifactRepositories;
