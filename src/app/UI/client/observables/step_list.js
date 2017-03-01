
import TypeList from "ui-observables/type_list";

class StepList extends TypeList {
    constructor(initialOpts) {
        if (typeof initialOpts.flowId !== "string" && initialOpts.flowId !== false) {
            throw new Error("flowId must be set to a string or false in the initial opts");
        }
        if (initialOpts.hasOwnProperty("visible") && typeof initialOpts.visible !== "boolean") {
            throw new Error("visible must be set to a boolean in the initial opts if existing");
        }

        const createQuery = (flowId, visible) => {
            const query = {
                "flow.id": flowId,
                visible: visible
            };

            return query;
        };

        const defaultOpts = {
            type: "flowctrl.step",
            query: createQuery(initialOpts.flowId, initialOpts.visible)
        };

        super(Object.assign({}, defaultOpts, initialOpts));

        this._createQuery = createQuery;
    }

    setOpts(opts) {
        const nextOpts = Object.assign({}, opts);
        const currOpts = this.opts.getValue().toJS();

        const flowId = opts.hasOwnProperty("flowId") ? opts.flowId : currOpts.flowId;
        const visible = opts.hasOwnProperty("visible") ? opts.visible : currOpts.visible;

        nextOpts.query = this._createQuery(flowId, visible);

        super.setOpts(nextOpts);
    }
}

export default StepList;
