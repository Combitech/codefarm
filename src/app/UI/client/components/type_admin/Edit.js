
import React from "react";
import api from "api.io/api.io-client";
import Component from "ui-lib/component";

class Edit extends Component {
    constructor(props) {
        super(props);
    }

    async onSave(type, data, options = {}) {
        this.log("save", data);

        const id = data._id;
        delete data._id;

        const result = await api.rest.save(type, id, data);

        if (!options.noRedirect) {
            const pathname = options.pathname || this.props.pathname;
            this.context.router.push({ pathname });
        }

        return result;
    }

    async onCreate(type, data, options = {}) {
        this.log("create", data);

        const result = await api.rest.post(type, data);

        if (!options.noRedirect) {
            const pathname = options.pathname || `${this.props.pathname}/${result._id}`;
            this.context.router.push({ pathname });
        }

        return result;
    }

    render() {
        this.log("Render", this.props);

        const pathname = this.getPathname();
        const breadcrumbs = this.props.breadcrumbs.concat({
            label: this.props.route.path === "create" ? "Create" : "Edit",
            pathname: pathname
        });

        const parentItems = this.props.parentItems.slice(0);
        let item;

        if (this.props.route.path === "create" && this.props.item) {
            parentItems.push(this.props.item);
        } else {
            item = this.props.item;
        }
        const props = {
            theme: this.props.theme,
            parentItems: parentItems,
            item: item,
            breadcrumbs: breadcrumbs,
            controls: [],
            pathname: this.props.pathname,
            context: this.props.context,
            onSave: (type, data, options) => {
                if (options.create) {
                    return this.onCreate(type, data, options);
                }

                return this.onSave(type, data, options);
            },
            onCancel: () => this.context.router.goBack()
        };

        if (props.item) {
            return (
                <this.props.route.Edit {...props} />
            );
        }

        return (
            <this.props.route.Create {...props} />
        );
    }
}

Edit.propTypes = {
    theme: React.PropTypes.object,
    pathname: React.PropTypes.string /* .isRequired */,
    breadcrumbs: React.PropTypes.array /* .isRequired */,
    parentItems: React.PropTypes.array /* .isRequired */,
    item: React.PropTypes.object,
    context: React.PropTypes.object,
    route: React.PropTypes.object.isRequired
};

Edit.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default Edit;
