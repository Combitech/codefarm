
/* Example usage:
 *
 * import stateVar from "ui-lib/state_var";
 *
 * class MyComponent extends React.Component {
 *     constructor(props) {
 *         super(props);
 *
 *         this.state = {
 *             myStateVar: stateVar(this, "myStateVar", "myInitalValue")
 *         };
 *     }
 *
 *     render() {
 *         render (
 *             <MyOtherComponent myStateVar={this.state.myStateVar} />
 *         );
 *     }
 * }
 *
 * class MyOtherComponent extends React.Component {
 *     constructor(props) {
 *         super(props);
 *     }
 *
 *     render() {
 *         render (
 *             <input type="text"
 *                 value={this.props.myStateVar.value}
 *                 onChange={this.props.myStateVar.update}
 *             />
 *             <FlatButton label="Set myState to Click"
 *                 onTocuhTap={this.props.myStateVar.set.bind(null, "Click")}
 *             />
 *             <FlatButton label="Toggle boolean myState"
 *                 onTocuhTap={this.props.myStateVar.toggle}
 *             />
 *         );
 *     }
 * }
 */

const stateVar = (inst, propName, initialValue) => {
    const varInst = {
        dead: false,
        initialValue: initialValue,
        value: initialValue,
        create: (value) => {
            if (!varInst.dead) {
                if (typeof value === "undefined") {
                    value = varInst.initialValue;
                }

                if (inst.state[propName].value !== value) {
                    const newStateVar = stateVar(inst, propName, value);
                    newStateVar.router = varInst.router;
                    newStateVar.route = varInst.route;
                    newStateVar.replace = varInst.replace;
                    newStateVar.initialValue = varInst.initialValue;
                    newStateVar.dead = varInst.dead;

                    return newStateVar;
                }
            }

            return varInst;
        },
        set: (value, callback) => {
            const newVarInst = varInst.create(value);

            if (varInst !== newVarInst) {
                if (newVarInst.router) {
                    const router = newVarInst.router;

                    const query = {};
                    for (const key of Object.keys(router.location.query)) {
                        query[key] = router.location.query[key];
                    }

                    if (newVarInst.value) {
                        query[propName] = newVarInst.value;
                    } else {
                        delete query[propName];
                    }

                    router[newVarInst.replace ? "replace" : "push"]({
                        pathname: router.location.pathname,
                        query: query
                    });
                } else {
                    const optArgs = (typeof callback === "function") ? [ callback ] : [];
                    inst.setState({
                        [propName]: newVarInst
                    }, ...optArgs);
                }

                return newVarInst;
            }

            return varInst;
        },
        update: (event) => {
            const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;

            return varInst.set(value);
        },
        toggle: () => varInst.set(!inst.state[propName].value),
        linkToLocation: (replace = false) => {
            const router = inst.context.router;
            const newVarInst = varInst.set(router.location.query[propName]);
            newVarInst.router = router;
            newVarInst.route = inst.props.route;
            newVarInst.replace = replace;

            newVarInst.onRouteChange = (prevState, nextState) => {
                const newState = {};
                for (const key of Object.keys(inst.state)) {
                    if (typeof inst.state[key] === "object" && inst.state[key].router) {
                        const queryParamVal = nextState.location.query[key];
                        const newStateVar = inst.state[key].create(queryParamVal);

                        if (newStateVar !== inst.state[key]) {
                            newState[key] = newStateVar;
                        }
                    }
                }

                if (Object.keys(newState).length > 0) {
                    inst.setState(newState);
                }
            };
            /* React router route.onChange only allows for a single listener.
             * Add property onChangeHandlers to route and install onChange listener
             * that triggers all handlers on onChangeHandlers
             */
            newVarInst.route.onChangeHandlers = newVarInst.route.onChangeHandlers || [];
            newVarInst.route.onChangeHandlers.push(newVarInst.onRouteChange);
            const onChangeHandler = (route, prevState, nextState) =>
                route.onChangeHandlers &&
                route.onChangeHandlers.forEach((handler) => handler(prevState, nextState));
            newVarInst.route.onChange = onChangeHandler.bind(null, newVarInst.route);
        },
        unlinkFromLocation: () => {
            if (varInst.onRouteChange) {
                // Handler exists, remove from onChangeHandlers
                if (varInst.route && varInst.route.onChangeHandlers) {
                    const removeIdx = varInst.route.onChangeHandlers.indexOf(varInst.onRouteChange);
                    if (removeIdx !== -1) {
                        varInst.route.onChangeHandlers.splice(removeIdx, 1);
                    }
                }
                delete varInst.onRouteChange;
            }
            if (varInst.route) {
                if (varInst.route.onChangeHandlers) {
                    if (varInst.route.onChangeHandlers.length === 0) {
                        delete varInst.route.onChangeHandlers;
                        varInst.route.onChange = null;
                    }
                } else {
                    varInst.route.onChange = null;
                }
            }
            delete varInst.router;
            delete varInst.route;
        },
        die: () => {
            varInst.unlinkFromLocation();
            varInst.dead = true;
        }
    };

    return varInst;
};

export default stateVar;
