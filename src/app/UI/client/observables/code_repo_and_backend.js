
import { States } from "ui-lib/observable_data";
import TypeItem from "ui-observables/type_item";

/** CodeRepoAndBackend fetches a coderepo repository and the backend data
 * associated with that repository.
 * The repository is accessible via CodeRepoAndBackend#value and the
 * backend is accessible via CodeRepoBackend#bakend.
 */
class CodeRepoAndBackend extends TypeItem {
    constructor(initialOpts, debug = false) {
        if (typeof initialOpts.repoId !== "string" && initialOpts.repoId !== false) {
            throw new Error("repoId must be set to a string or false in the initial opts");
        }

        const defaultOpts = {
            type: "coderepo.repository",
            id: initialOpts.repoId || false,
            subscribe: false
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);

        this._backend = new TypeItem({
            type: "coderepo.backend",
            id: false,
            subscribe: false
        }, debug);
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
        return this._backend.value;
    }

    start() {
        super.start();
        this.addDisposable(this._backend.start());

        // When coderepo is fetched, set backend id
        this.addDisposable(this.value.subscribe((repo) => {
            if (this.state.getValue() === States.DISPOSED) {
                return;
            }

            if (repo.has("backend")) {
                this._backend.setOpts({
                    id: repo.get("backend")
                });
            }
        }));

        return this;
    }
}

export default CodeRepoAndBackend;
