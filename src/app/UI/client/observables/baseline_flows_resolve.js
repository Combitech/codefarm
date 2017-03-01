
import DataResolve from "ui-observables/data_resolve";

class BaselineFlowsResolve extends DataResolve {
    constructor(initialOpts) {
        if (typeof initialOpts.baselineName !== "string") {
            throw new Error("baselineName must be set to a string in the initial opts");
        }

        const createResolveOpts = (baselineName) => (
            {
                baselineName: baselineName
            }
        );

        const defaultOpts = {
            resolver: "BaselineFlowsResolve",
            opts: createResolveOpts(initialOpts.baselineName)
        };

        const opts = Object.assign({}, defaultOpts, initialOpts);

        delete opts.baselineName;

        super(opts);

        this._createResolveOpts = createResolveOpts;
    }

    setOpts(opts) {
        const nextOpts = Object.assign({}, opts);

        if (opts.baselineName) {
            delete nextOpts.baselineName;

            nextOpts.opts = this._createResolveOpts(opts.baselineName);
        }

        super.setOpts(nextOpts);
    }
}

export default BaselineFlowsResolve;
