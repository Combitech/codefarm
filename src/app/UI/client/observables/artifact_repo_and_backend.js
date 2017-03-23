
import TypeItemResolveRef from "ui-observables/type_item_resolve_ref";

/** ArtifactRepoAndBackend fetches a coderepo repository and the backend data
 * associated with that repository.
 * The repository is accessible via ArtifactRepoAndBackend#value and the
 * backend is accessible via ArtifactRepoAndBackend#bakend.
 */
class ArtifactRepoAndBackend extends TypeItemResolveRef {
    constructor(initialOpts, debug = false) {
        if (typeof initialOpts.repoId !== "string" && initialOpts.repoId !== false) {
            throw new Error("repoId must be set to a string or false in the initial opts");
        }

        const defaultOpts = {
            type: "artifactrepo.repository",
            id: initialOpts.repoId || false,
            refType: "artifactrepo.backend",
            refIdPath: "backend",
            subscribe: false,
            refSubscribe: false
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);
    }

    setOpts(opts) {
        const nextOpts = Object.assign({}, opts);
        if (nextOpts.repoId) {
            nextOpts.id = nextOpts.repoId;
            delete nextOpts.repoId;
        }

        super.setOpts(nextOpts);
    }

    get backend() {
        return this.refItem.value;
    }
}

export default ArtifactRepoAndBackend;
