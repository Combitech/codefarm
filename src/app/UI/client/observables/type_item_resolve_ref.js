
import { States } from "ui-lib/observable_data";
import TypeItem from "ui-observables/type_item";

/** TypeItemResolveRef fetches a type and optionally a type referenced
 * by the first type.
 * Opts id, type and subscribe refers to the parent type.
 * Opt refPath tells which ref to resolve in the parent type in order to fetch
 * the child type.
 * If parent doesn't have a real ref, opts refIdPath together with refType can
 * be used to fetch the child type instead.
 *
 * The referenced type observable is accessible via TypeItemResolveRef#refItem
 */
class TypeItemResolveRef extends TypeItem {
    constructor(initialOpts, debug = false) {
        // Opts from TypeItem: type, id and subscribe
        // Use either opt refPath or opts refIdPath and refType
        if (initialOpts.hasOwnProperty("refPath")) {
            if (typeof initialOpts.refPath !== "string" && initialOpts.refPath !== false) {
                throw new Error("refPath must be set to a string or false in the initial opts");
            }
        } else {
            if (typeof initialOpts.refIdPath !== "string" && initialOpts.refIdPath !== false) {
                throw new Error("refIdPath must be set to a string or false in the initial opts");
            }
            if (typeof initialOpts.refType !== "string" && initialOpts.refType !== false) {
                throw new Error("refType must be set to a string or false in the initial opts");
            }
        }

        const defaultOpts = {
            refPath: false,
            refIdPath: false,
            refType: false,
            refSubscribe: true
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);

        this._refItem = new TypeItem({
            type: this.opts.getValue().get("refType", false),
            id: false,
            subscribe: this.opts.getValue().get("refSubscribe")
        }, debug);
    }

    get refItem() {
        return this._refItem;
    }

    start() {
        super.start();
        this.addDisposable(this._refItem.start());

        // When coderepo is fetched, set backend id
        this.addDisposable(this.value.subscribe((value) => {
            if (this.state.getValue() === States.DISPOSED) {
                return;
            }

            const opts = this.opts.getValue().toJS();

            // TODO: Support paths that isn't just a single field on first root level
            let ref;
            if (opts.refPath && value.has(opts.refPath)) {
                ref = value.get(opts.refPath).toJS();
            } else if (opts.refIdPath && opts.refType && value.has(opts.refIdPath)) {
                // Support types that references other type but only with
                // and id.
                ref = {
                    id: value.get(opts.refIdPath),
                    type: opts.refType
                };
            }

            if (ref) {
                this._refItem.setOpts({
                    id: ref.id,
                    type: ref.type
                });
            }
        }));

        return this;
    }
}

export default TypeItemResolveRef;
