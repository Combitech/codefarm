
import React from "react";
import api from "api.io/api.io-client";
import Component from "ui-lib/component";

class Remove extends Component {
    constructor(props) {
        super(props);
    }

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
            pathname: this.props.pathname,
            context: this.props.context,
            onRemove: (...args) => this.onRemove(...args),
            onCancel: () => this.context.router.goBack()
        };

        return (
            <this.props.route.Remove {...props} />
        );
    }
}

Remove.propTypes = {
    theme: React.PropTypes.object,
    pathname: React.PropTypes.string /* .isRequired */,
    breadcrumbs: React.PropTypes.array /* .isRequired */,
    item: React.PropTypes.object /* .isRequired */,
    parentItems: React.PropTypes.array /* .isRequired */,
    context: React.PropTypes.object
};

Remove.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default Remove;
