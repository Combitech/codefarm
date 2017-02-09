
import React from "react";
import stateVar from "ui-lib/state_var";
import type from "ui-lib/type";

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
            if (route.path.startsWith(":")) {
                return params[route.path.substr(1)];
            } else if (route.path === "/") {
                return "";
            }

            return route.path;
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
        const newId = await Promise.resolve(asyncVar.id(props));

        if (asyncVar._type === newType && asyncVar._id === newId) {
            return; // Already loaded
        }

        if (asyncVar._type && asyncVar._id) {
            this.log("_loadAsyncVarList", "reload");
        }

        asyncVar._type = newType;
        asyncVar._id = newId;

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

        if (asyncVar.subscribe) {
            asyncVar.subId = await type.subscribeToItemAsync(asyncVar._type, asyncVar._id, set);
        } else {
            set(await type.fetchItem(asyncVar._type, asyncVar._id));
        }
    }

    async _loadAsyncVarList(asyncVar, props) {
        this.log("_loadAsyncVarList", asyncVar);

        const newType = asyncVar.type(props);
        const newQuery = asyncVar.query(props);

        if (asyncVar._type === newType && JSON.stringify(asyncVar._query) === JSON.stringify(newQuery)) {
            return; // Already loaded
        }

        if (asyncVar._type && asyncVar._query) {
            this.log("_loadAsyncVarList", "reload");
        }

        asyncVar._type = newType;
        asyncVar._query = newQuery;

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
            asyncVar.subId = await type.subscribeToListAsync(asyncVar._type, asyncVar._query, set);
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
