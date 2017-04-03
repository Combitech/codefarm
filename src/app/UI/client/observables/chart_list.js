
import TypeList from "ui-observables/type_list";

class ChartList extends TypeList {
    constructor(initialOpts) {
        const defaultOpts = {
            type: "stat.chart",
            query: {},
            filterFields: [ "name", "statRef.id", "tags" ]
        };

        super(Object.assign({}, defaultOpts, initialOpts));
    }
}

export default ChartList;
