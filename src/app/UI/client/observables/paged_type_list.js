
import Immutable from "immutable";
import Rx from "rxjs";
import TypeList from "ui-observables/type_list";

const SET_PAGE_KIND = {
    NEXT: "NEXT",
    PREV: "PREV",
    FIRST: "FIRST",
    LAST: "LAST"
};

class PagedTypeList extends TypeList {
    constructor(initialOpts, debug = false) {
        const defaultOpts = {
            query: {},
            limit: 10,
            sortOn: "statusSetAt",
            sortOnType: "Date",
            relativeValue: null,
            isRelativeFrom: true,
            sortDesc: true,
            filter: "",
            filterFields: [],
            trackMoreData: true
        };

        super(Object.assign({}, defaultOpts, initialOpts), debug);
        this._pagingInfo = new Rx.BehaviorSubject(Immutable.fromJS({
            hasNextPage: false,
            hasPrevPage: false,
            isFirstPage: true,
            isLastPage: false,
            isRelative: this.opts.getValue().get("relativeValue") !== null
        }));
    }

    start() {
        super.start();

        this.addDisposable(this.value.subscribe((value) => {
            const setIfChanged = (orderedMap, set) => {
                Object.keys(set).forEach((key) => {
                    const value = set[key];
                    if (orderedMap.get(key) !== value) {
                        orderedMap = orderedMap.set(key, value);
                    }
                });

                return orderedMap;
            };
            let pagingInfo = this._pagingInfo.getValue();
            const opts = this.opts.getValue().toJS();
            let isRelative = true;
            let isFirstPage = false;
            let isLastPage = false;
            if (opts.relativeValue === null) {
                isRelative = false;
                if (opts.isRelativeFrom) {
                    isFirstPage = true;
                } else {
                    isLastPage = true;
                }
            }

            const hasPrevPage = !isFirstPage && value.size > 0 && (
                this.hasMoreData.getValue() ||
                opts.isRelativeFrom
            );
            const hasNextPage = !isLastPage && value.size > 0 && (
                this.hasMoreData.getValue() ||
                !opts.isRelativeFrom
            );
            pagingInfo = setIfChanged(pagingInfo, {
                isRelative,
                isFirstPage,
                isLastPage,
                hasPrevPage,
                hasNextPage
            });


            if (pagingInfo !== this._pagingInfo.getValue()) {
                this.log("next pagingInfo", pagingInfo.toJS());
                this._pagingInfo.next(pagingInfo);
            }
        }));

        return this;
    }

    get pagingInfo() {
        return this._pagingInfo;
    }

    get isRelative() {
        return this._isRelative;
    }

    _buildQuery(opts) {
        const newOpts = Object.assign({}, opts, {
            // Override sortDesc
            sortDesc: opts.isRelativeFrom
        });
        let query = super._buildQuery(newOpts);
        if (newOpts.hasOwnProperty("relativeValue") && newOpts.relativeValue !== null) {
            const cmpOp = newOpts.isRelativeFrom ? "$lt" : "$gt";
            query = Object.assign({}, query, {
                [ newOpts.sortOn ]: {
                    [ cmpOp ]: newOpts.relativeValue
                }
            });
            // We need to explicitly convert types due to JSON not carrying type info
            query.__types = Object.assign({}, query.__types, {
                [ `${newOpts.sortOn}.${cmpOp}` ]: newOpts.sortOnType
            });
        }

        return query;
    }

    async _fetch(opts, query) {
        const list = await super._fetch(opts, query);

        // If relative search direction doesn't match sort, reverse list
        if (opts.sortDesc !== opts.isRelativeFrom) {
            list.reverse();
        }

        return list;
    }

    _setPage(kind) {
        const isRelative = kind === SET_PAGE_KIND.NEXT || kind === SET_PAGE_KIND.PREV;
        const isRelativeFrom = kind === SET_PAGE_KIND.NEXT || kind === SET_PAGE_KIND.FIRST;
        let relativeValue = null;
        if (isRelative) {
            const sortOn = this.opts.getValue().get("sortOn");
            const list = this.value.getValue();
            const relativeItem = isRelativeFrom ? list.last() : list.first();
            relativeValue = relativeItem.get(sortOn);
        }
        this.setOpts({
            isRelativeFrom,
            relativeValue
        });
    }

    setNextPage() {
        this._setPage(SET_PAGE_KIND.NEXT);
    }

    setPrevPage() {
        this._setPage(SET_PAGE_KIND.PREV);
    }

    setFirstPage() {
        this._setPage(SET_PAGE_KIND.FIRST);
    }

    setLastPage() {
        this._setPage(SET_PAGE_KIND.LAST);
    }
}

export default PagedTypeList;
