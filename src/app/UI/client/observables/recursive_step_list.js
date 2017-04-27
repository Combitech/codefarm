
import TypeList from "ui-observables/type_list";
import api from "api.io/api.io-client";

class RecursiveStepList extends TypeList {
    constructor(initialOpts) {
        if (typeof initialOpts.flowId !== "string" && initialOpts.flowId !== false) {
            throw new Error("flowId must be set to a string or false in the initial opts");
        }

        const createQuery = (flowId) => {
            const query = {
                "flow.id": flowId,
                visible: true
            };

            return query;
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
        const currOpts = this.opts.getValue().toJS();

        const flowId = opts.hasOwnProperty("flowId") ? opts.flowId : currOpts.flowId;

        nextOpts.query = this._createQuery(flowId);

        super.setOpts(nextOpts);
    }

    async _fetch(opts, query) {
        const steps = await api.type.get(opts.type, query);

        let list = steps;

        for (const step of steps) {
            if (opts.parentStep && step.parentSteps.length === 0) {
                step.parentSteps.push(opts.parentStep);
            }

            if (step.connectedFlow) {
                const connectedSteps = await this._fetch({
                    type: opts.type,
                    parentStep: step._id
                }, this._createQuery(step.connectedFlow.id));

                list = list.concat(connectedSteps);
            }
        }

        return list;
    }
}

export default RecursiveStepList;
