
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
        set: (value) => {
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
                    inst.setState({
                        [propName]: newVarInst
                    });
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
            const newVarInst = varInst.set(inst.props.location.query[propName]);
            newVarInst.router = inst.props.router;
            newVarInst.route = inst.props.route;
            newVarInst.replace = replace;

            newVarInst.route.onChange = (prevState, nextState) => {
                const newState = {};

                for (const key of Object.keys(inst.state)) {
                    if (typeof inst.state[key] === "object" && inst.state[key].router) {
                        const newStateVar = inst.state[key].create(nextState.location.query[key]);

                        if (newStateVar !== inst.state[key]) {
                            newState[key] = newStateVar;
                        }
                    }
                }

                if (Object.keys(newState).length > 0) {
                    inst.setState(newState);
                }
            };
        },
        unlinkFromLocation: () => {
            varInst.onChange = null;
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
