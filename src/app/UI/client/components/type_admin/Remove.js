
import React from "react";
import PropTypes from "prop-types";
import api from "api.io/api.io-client";
import LightComponent from "ui-lib/light_component";

class Remove extends LightComponent {
    async onRemove(type, id, options = {}) {
        this.log("remove", type, id);

        const result = await api.rest.remove(type, id);

        if (!options.noRedirect) {
            this.context.router.push({
                pathname: this.props.pathname.split("/").slice(0, -1).join("/")
            });
        }

        return result;
    }

    render() {
        this.log("render", this.props);

        const breadcrumbs = this.props.breadcrumbs.concat({
            label: "Remove",
            pathname: ""
        });

        const props = {
            theme: this.props.theme,
            parentItems: this.props.parentItems,
            item: this.props.item,
            breadcrumbs: breadcrumbs,
            controls: [],
            menuItems: [],
            pathname: this.props.pathname,
            context: this.props.context,
            route: this.props.route,
            onRemove: (...args) => this.onRemove(...args),
            onCancel: () => this.context.router.goBack()
        };

        if (this.props.item) {
            return (
                <this.props.route.Remove {...props} />
            );
        }

        return null;
    }
}

Remove.propTypes = {
    theme: PropTypes.object,
    pathname: PropTypes.string /* .isRequired */,
    breadcrumbs: PropTypes.array /* .isRequired */,
    item: PropTypes.object /* .isRequired */,
    parentItems: PropTypes.array /* .isRequired */,
    context: PropTypes.object,
    route: PropTypes.object.isRequired
};

Remove.contextTypes = {
    router: PropTypes.object.isRequired
};

export default Remove;
