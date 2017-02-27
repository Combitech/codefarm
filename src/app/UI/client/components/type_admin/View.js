
import React from "react";
import TypeItem from "ui-observables/type_item";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import stateVar from "ui-lib/state_var";
import LightComponent from "ui-lib/light_component";
import LoadIndicator from "./LoadIndicator";
import ControlButton from "./ControlButton";

class View extends LightComponent {
    constructor(props) {
        super(props);

        this.log("Constructor");

        this.item = new TypeItem({
            type: props.route.type,
            id: props.params[props.route.path.substr(1).split("/")[0]] || false,
            subscribe: props.route.path.startsWith(":")
        });

        this.state = {
            context: stateVar(this, "context", {}),
            item: this.item.value.getValue(),
            state: this.item.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.item.start());
        this.addDisposable(this.item.value.subscribe((item) => this.setState({ item })));
        this.addDisposable(this.item.state.subscribe((state) => this.setState({ state })));
    }

    componentWillReceiveProps(nextProps) {
        this.item.setOpts({
            id: nextProps.params[nextProps.route.path.substr(1).split("/")[0]] || false
        });
    }

    render() {
        this.log("render", this.props, JSON.stringify(this.state, null, 2));

        if (this.state.state === ObservableDataStates.LOADING) {
            return (
                <LoadIndicator
                    theme={this.props.theme}
                />
            );
        }

        const parentItems = this.props.parentItems.slice(0);

        if (this.props.item) {
            parentItems.push(this.props.item);
        }

        const props = {
            theme: this.props.theme,
            parentItems: parentItems,
            item: this.state.item.toJS()._id ? this.state.item.toJS() : null,
            breadcrumbs: this.props.breadcrumbs,
            controls: [],
            pathname: this.getPathname(),
            context: this.props.context || this.state.context
        };

        if (props.item) {
            props.breadcrumbs = props.breadcrumbs.concat({
                label: props.item._id,
                pathname: this.getPathname()
            });
        } else {
            props.breadcrumbs = props.breadcrumbs.concat({
                label: this.props.route.label,
                pathname: this.getPathname()
            });
        }

        if (this.props.children) {
            return (
                <this.props.children.type
                    {...this.props.children.props}
                    {...props}
                />
            );
        }

        const childRoutes = this.props.route.childRoutes;
        if (props.item) {
            if (childRoutes) {
                if (childRoutes.find((route) => route.path === "create")) {
                    props.controls.push((
                        <ControlButton
                            theme={this.props.theme}
                            key="create"
                            label="Create"
                            pathname={`${props.pathname}/create`}
                        />
                    ));
                }

                if (childRoutes.find((route) => route.path === "edit")) {
                    props.controls.push((
                        <ControlButton
                            theme={this.props.theme}
                            key="edit"
                            label="Edit"
                            pathname={`${props.pathname}/edit`}
                        />
                    ));
                }

                if (childRoutes.find((route) => route.path === "remove")) {
                    props.controls.push((
                        <ControlButton
                            theme={this.props.theme}
                            key="remove"
                            label="Remove"
                            pathname={`${props.pathname}/remove`}
                        />
                    ));
                }
            }

            if (this.props.route.Item) {
                return (
                    <this.props.route.Item
                        {...props}
                        route={this.props.route}
                        type={this.props.route.type}
                    />
                );
            }
        }

        if (childRoutes && childRoutes.find((route) => route.path === "create")) {
            props.controls.push((
                <ControlButton
                    theme={this.props.theme}
                    key="create"
                    label="Create"
                    pathname={`${props.pathname}/create`}
                />
            ));
        }

        return (
            <div className={this.props.theme.view}>
                {this.props.route.List && <this.props.route.List
                    {...props}
                    route={this.props.route}
                    type={this.props.route.type}
                />}
            </div>
        );
    }
}

View.defaultProps = {
    parentItems: [],
    breadcrumbs: []
};

View.propTypes = {
    theme: React.PropTypes.object,
    parentItems: React.PropTypes.array,
    item: React.PropTypes.object,
    params: React.PropTypes.object.isRequired,
    route: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
    children: React.PropTypes.node,
    breadcrumbs: React.PropTypes.array,
    context: React.PropTypes.object
};

export default View;
