
import React from "react";

let instanceCounter = 0;

class LightComponent extends React.PureComponent {
    constructor(props) {
        super(props);

        this.debug = false;
        this.id = instanceCounter++;
        this.disposables = [];

        this.log("LightComponent Constructor");
    }

    setDebug(debug = true) {
        this.debug = debug;
    }

    log(...args) {
        if (this.debug) {
            console.log(`${this.constructor.name}[${this.id}]`, ...args);
        }
    }

    logError(...args) {
        console.error(`${this.constructor.name}[${this.id}]`, ...args);
    }

    addDisposable(disposable) {
        this.disposables.push(disposable);
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

    dispose() {
        for (const disposable of this.disposables) {
            disposable.unsubscribe && disposable.unsubscribe();
            disposable.dispose && disposable.dispose();
        }

        this.disposables = [];
    }

    componentWillUnmount() {
        this.log("componentWillUnmount");
        this.dispose();
    }
}


LightComponent.propTypes = {
    routes: React.PropTypes.array,
    route: React.PropTypes.any,
    params: React.PropTypes.object
};

export default LightComponent;
