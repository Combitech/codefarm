
import TypeList from "ui-observables/type_list";

class StepList extends TypeList {
    constructor(initialOpts) {
        if (typeof initialOpts.flowId !== "string" && initialOpts.flowId !== false) {
            throw new Error("flowId must be set to a string or false in the initial opts");
        }

        const createQuery = (flowId) => {
            return {
                "flow.id": flowId,
                visible: true
            };
        };

        const defaultOpts = {
            type: "flowctrl.step",
            query: createQuery(initialOpts.flowId)
        };

        super(Object.assign({}, defaultOpts, initialOpts));

        this._createQuery = createQuery;
    }

    setOpts(opts) {
        const nextOpts = Object.assign({}, opts);

        if (opts.flowId) {
            nextOpts.query = this._createQuery(opts.flowId);
        }

        super.setOpts(nextOpts);
    }
}

export default StepList;
