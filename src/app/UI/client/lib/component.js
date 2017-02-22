
import api from "api.io/api.io-client";
import React from "react";
import stateVar from "ui-lib/state_var";
import type from "ui-lib/type";
import { assertProp } from "misc";

let instanceCounter = 0;

const LifecycleState = {
    CONSTRUCTED: "CONSTRUCTED",
    MOUNTED: "MOUNTED",
    NOT_MOUNTED: "NOT_MOUNTED"
};

class Component extends React.PureComponent {
    constructor(props, debug = false) {
        super(props);

        this.lifecycleState = LifecycleState.CONSTRUCTED;

        this.debug = debug;
        this.id = instanceCounter++;

        this.state = {};
        this.locationVariables = [];
        this.asyncVariables = [];

        this.addStateVariable("loadingAsync", true);
        this.addStateVariable("errorAsync", false);

        this.log("Component Constructor", JSON.stringify(this.state, null, 2));
    }

    get _isMounted() {
        return this.lifecycleState === LifecycleState.MOUNTED;
    }


    /* Methods to implement in child classes for lifecycle hooks */

    async componentWillReceivePropsAsync() {

    }

    async componentDidMountAsync() {

    }

    async componentWillUnmountAsync() {

    }


    /* Methods available to child classes */

    addStateVariable(name, defaultValue, linkToLocation = false) {
        // TODO: linkToLocation is broken!
        this.log("addStateVariable", name, defaultValue, linkToLocation);

        this.state[name] = stateVar(this, name, defaultValue); // eslint-disable-line react/no-direct-mutation-state

        if (linkToLocation) {
            this.locationVariables.push(name);
        }
    }

    /** Add state variable containing a list of type instances
     * List items will be of given type matching given query.
     * @param {String} name State variable name
     * @param {String} type Type or function (props) => type
     * @param {Object|Function} [query] Query or function (props) => query
     * @param {Boolean} [subscribe] If state variable shall be updated when source updates
     * @returns {undefined}
     */
    addTypeListStateVariable(name, type, query = {}, subscribe = false) {
        this.log("addTypeListStateVariable", name, type, query, subscribe);

        this.state[name] = []; // eslint-disable-line react/no-direct-mutation-state

        this.asyncVariables.push({
            name,
            type: typeof type === "function" ? type : () => type,
            query: typeof query === "function" ? query : () => query,
            subscribe: subscribe,
            list: true
        });
    }

    /** Add state variable containing a list of type instances
     * List items will be of given type matching given query.
     * @param {String} name State variable name
     * @param {String} type Type or function (props) => type
     * @param {Object} pagingOpts Paging options
     * @param {Number} pagingOpts.sortOn Type key to sort on
     * @param {Number} pagingOpts.sortOnType JS Type that sortOn specifies
     * @param {Number} pagingOpts.relativeValue Value that current page is related to
     * @param {Number} [pagingOpts.pageSize] Page size
     * @param {Number} [pagingOpts.sortDesc] Sort descending, defaults to true
     * @param {Number} [pagingOpts.hasMoreDataCb] Callback called to notify if next page has data
     * @param {Object|Function} [query] Query or function (props) => query
     * @param {Boolean} [subscribe] If state variable shall be updated when source updates
     * @returns {undefined}
     */
    addTypePagedListStateVariable(name, type, pagingOpts, query = {}, subscribe = false) {
        // pageSize = 10, sortOn = "created", sortOnValue = null, sortDesc = true, nextPageHasMoreDataCb = false,
        if (pagingOpts === null || typeof pagingOpts !== "function") {
            throw new Error("pagingOpts not specified");
        }
        this.log("addTypePagedListStateVariable", name, type, query, subscribe, JSON.stringify(pagingOpts));

        this.state[name] = []; // eslint-disable-line react/no-direct-mutation-state

        this.asyncVariables.push({
            name,
            type: typeof type === "function" ? type : () => type,
            query: typeof query === "function" ? query : () => query,
            pagingOpts: (props) => {
                const opts = pagingOpts(props);
                const setDefault = (obj, key, defaultValue) => {
                    if (!obj.hasOwnProperty(key)) {
                        obj[key] = defaultValue;
                    }
                };
                setDefault(opts, "pageSize", 20);
                setDefault(opts, "sortDesc", true);
                setDefault(opts, "hasMoreDataCb", () => null);
                assertProp(opts, "sortOn");
                assertProp(opts, "sortOnType");
                assertProp(opts, "relativeValue");

                return opts;
            },
            subscribe: subscribe,
            list: true
        });
    }

    /** Add state variable containing one type instance
     * Type matching type and id will be fetched
     * @param {String} name State variable name
     * @param {String} type Type or function (props) => type
     * @param {String|Function} id Id or function (props) => id
     * @param {Boolean} [subscribe] If state variable shall be updated when source updates
     * @returns {undefined}
     */
    addTypeItemStateVariable(name, type, id, subscribe = false) {
        this.log("addTypeItemStateVariable", name, type, id, subscribe);

        this.state[name] = false; // eslint-disable-line react/no-direct-mutation-state

        this.asyncVariables.push({
            name,
            type: typeof type === "function" ? type : () => type,
            id: typeof id === "function" ? id : () => id,
            subscribe: subscribe,
            item: true
        });
    }

    /** Add state variable containing one type instance
     * Like {@link Component#addTypeItemStateVariable} except that a REST create
     * body is given instead of an explicit id. This allows for subscribing to
     * a new type instance.
     * @param {String} name State variable name
     * @param {String} type Type or function (props) => type
     * @param {Object|Function} createBody Create body or function (props) => create body
     * @param {Boolean} [subscribe] If state variable shall be updated when source updates
     * @returns {undefined}
     */
    addTypeItemStateVariableWithCreate(name, type, createBody, subscribe = false) {
        this.log("addTypeItemStateVariableWithCreate", name, type, createBody, subscribe);

        this.state[name] = false; // eslint-disable-line react/no-direct-mutation-state

        this.asyncVariables.push({
            name,
            type: typeof type === "function" ? type : () => type,
            createBody: typeof createBody === "function" ? createBody : () => createBody,
            subscribe: subscribe,
            item: true
        });
    }

    getPathname() {
        const routes = this.props.routes;
        const route = this.props.route;
        const params = this.props.params;

        if (!routes || !route || !params) {
            return false;
        }

        const idx = routes.indexOf(route);
        const list = routes.slice(0, idx + 1);
        const parts = list.map((route) => {
            if (route.path === "/") {
                return "";
            }

            // Find and resolve parameters in route, they begin with :
            return route.path
                .split("/")
                .map((part) => part.startsWith(":") ? params[part.substr(1)] : part)
                .join("/");
        });

        return parts.join("/");
    }

    log(...args) {
        if (this.debug) {
            console.log(`${this.constructor.name}[${this.id}]`, ...args);
        }
    }


    /* Internal methods */

    async _loadAsyncVarItem(asyncVar, props) {
        this.log("_loadAsyncVarItem", asyncVar);

        const newType = asyncVar.type(props);
        if (asyncVar.createBody) {
            const newCreateBody = asyncVar.createBody(props);
            if (asyncVar._type === newType && JSON.stringify(asyncVar._createBody) === JSON.stringify(newCreateBody)) {
                return; // Already loaded
            }

            asyncVar._createBody = newCreateBody;
        } else {
            const newId = asyncVar.id(props);

            if (asyncVar._type === newType && asyncVar._id === newId) {
                return; // Already loaded
            }

            asyncVar._id = newId;
        }

        asyncVar._type = newType;

        if (asyncVar._type && (asyncVar._id || asyncVar._createBody)) {
            this.log("_loadAsyncVarItem", "reload");
        }

        type.unsubscribe(asyncVar.subId);

        const set = (value) => {
            if (this._isMounted) {
                this.setState({ [asyncVar.name]: value });
            }
        };

        if (this._isMounted) {
            this.state.loadingAsync.set(true);
            set(false);
        }

        if (asyncVar._type && asyncVar._createBody) {
            const data = await api.rest.post(asyncVar._type, asyncVar._createBody);

            asyncVar._id = data._id;
        }

        if (asyncVar.subscribe) {
            asyncVar.subId = await type.subscribeToItemAsync(asyncVar._type, asyncVar._id, set);
        } else {
            set(await type.fetchItem(asyncVar._type, asyncVar._id));
        }
    }

    async _loadAsyncVarList(asyncVar, props) {
        this.log("_loadAsyncVarList", asyncVar);
        const isPaged = typeof asyncVar.pagingOpts === "function";

        const newType = asyncVar.type(props);
        const newQuery = asyncVar.query(props);
        let newPagingOpts;
        let pagedParamsAlreadyLoaded = true;
        if (isPaged) {
            newPagingOpts = asyncVar.pagingOpts(props);
            pagedParamsAlreadyLoaded = JSON.stringify(asyncVar._pagingOpts) === JSON.stringify(newPagingOpts);
        }

        if (asyncVar._type === newType &&
            JSON.stringify(asyncVar._query) === JSON.stringify(newQuery) &&
            pagedParamsAlreadyLoaded) {
            return; // Already loaded
        }

        // Handle paged list
        if (asyncVar._type && asyncVar._query) {
            this.log("_loadAsyncVarList", "reload");
        }

        asyncVar._type = newType;
        asyncVar._query = newQuery;
        if (isPaged) {
            asyncVar._pagingOpts = newPagingOpts;
            // Paging done using relative find followed by limit
            // - Sort results depending on field "sortOn" depending on "sortDesc"
            // - If "relativeValue" is given, find field "sortOn" values
            //   less than "relativeValue" if "sortDesc", otherwise find values
            //   greater than "relativeValue".
            asyncVar._query.__options = Object.assign(
                {},
                asyncVar._query.__options,
                {
                    // Fetch one more than needed to determine if more data available on next page
                    limit: newPagingOpts.pageSize + 1,
                    sort: {
                        [ newPagingOpts.sortOn ]: newPagingOpts.sortDesc ? -1 : 1
                    }
                }
            );
            if (newPagingOpts.relativeValue !== null) {
                const cmpOp = newPagingOpts.sortDesc ? "$lt" : "$gt";
                Object.assign(asyncVar._query, {
                    [ newPagingOpts.sortOn ]: {
                        [ cmpOp ]: newPagingOpts.relativeValue
                    }
                });
                // We need to explicitly convert types due to JSON not carrying type info
                asyncVar._query.__types = Object.assign(
                    {},
                    asyncVar._query.__types,
                    {
                        [ `${newPagingOpts.sortOn}.${cmpOp}` ]: newPagingOpts.sortOnType
                    }
                );
            }
        }

        type.unsubscribe(asyncVar.subId);

        const set = (value) => {
            if (this._isMounted) {
                this.setState({ [asyncVar.name]: value });
            }
        };

        if (this._isMounted) {
            this.state.loadingAsync.set(true);
            set([]);
        }

        if (asyncVar.subscribe) {
            let pagingOpts = false;
            if (isPaged) {
                pagingOpts = {
                    pageSize: asyncVar._pagingOpts.pageSize,
                    sortOn: asyncVar._pagingOpts.sortOn,
                    sortDesc: asyncVar._pagingOpts.sortDesc,
                    hasMoreDataCb: asyncVar._pagingOpts.hasMoreDataCb
                };
            }
            asyncVar.subId = await type.subscribeToListAsync(
                asyncVar._type, asyncVar._query, set, pagingOpts
            );
        } else {
            set(await type.fetchList(asyncVar._type, asyncVar._query));
        }
    }

    async _loadAsyncVars(props) {
        this.log("_loadAsyncVars", JSON.stringify(this.state, null, 2));

        for (const asyncVar of this.asyncVariables) {
            if (this._isMounted) {
                if (asyncVar.list) {
                    await this._loadAsyncVarList(asyncVar, props);
                } else {
                    await this._loadAsyncVarItem(asyncVar, props);
                }
            }
        }

        if (this._isMounted) {
            this.state.loadingAsync.set(false);
        }
    }

    async _componentDidMountAsync() {
        this.log("_componentDidMountAsync");

        await this.componentDidMountAsync();
        await this._loadAsyncVars(this.props);
    }


    /* React component lifecycle hooks */

    componentWillReceiveProps(nextProps) {
        this.log("componentWillReceiveProps", nextProps);

        this._loadAsyncVars(nextProps)
        .then(() => this.componentWillReceivePropsAsync(nextProps))
        .catch((error) => {
            this.state.errorAsync.set(error);
            this.log("ERROR", "componentWillReceiveProps", error);
        });
    }

    componentDidMount() {
        this.lifecycleState = LifecycleState.MOUNTED;
        this.log("componentDidMount", JSON.stringify(this.state, null, 2));

        for (const name of this.locationVariables) {
            this.state[name].linkToLocation();
        }

        this._componentDidMountAsync().catch((error) => {
            this.state.errorAsync.set(error);
            this.log("ERROR", "componentDidMountAsync", error);
        });
    }

    componentWillUnmount() {
        this.lifecycleState = LifecycleState.NOT_MOUNTED;
        this.log("componentWillUnmount", this);

        for (const name of Object.keys(this.state)) {
            if (this.state[name] && this.state[name].die) {
                this.state[name].die();
            }
        }

        for (const asyncVar of this.asyncVariables) {
            type.unsubscribe(asyncVar.subId);
        }

        this.componentWillUnmountAsync().catch((error) => {
            console.error("componentWillUnmount", error);
        });
    }
}

Component.propTypes = {
    routes: React.PropTypes.array,
    route: React.PropTypes.string,
    params: React.PropTypes.object
};

export default Component;
