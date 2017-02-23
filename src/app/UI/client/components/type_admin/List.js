
import React from "react";
import Component from "ui-lib/component";
import LoadIndicator from "./LoadIndicator";
import ListComponentItem from "./ListItem";
import ListComponent from "./ListComponent";
import { ListDivider } from "react-toolbox/lib/list";
import { filterFields as qbFilterFields } from "ui-lib/query_builder";

class List extends Component {
    constructor(props) {
        super(props);

        this.addTypeListStateVariable(
            "list",
            (props) => props.type,
            (props) => {
                let filterQuery = {};
                if (props.filterFields.length > 0 && props.filter && props.filter.length > 0) {
                    filterQuery = qbFilterFields(props.filterFields, props.filter, "si");
                }

                return Object.assign({}, props.query, filterQuery);
            },
            true
        );
    }

    render() {
        this.log("render", this.props, this.state);

        if (this.state.errorAsync.value) {
            return (
                <div>{this.state.errorAsync.value}</div>
            );
        }

        if (this.state.loadingAsync.value) {
            return (
                <LoadIndicator
                    theme={this.props.theme}
                />
            );
        }

        return (
            <this.props.ListComponent
                theme={this.props.theme}
                children={this.state.list && this.state.list.slice(0).reverse().map((item) => (
                    <this.props.ListItemComponent
                        key={item._id}
                        theme={this.props.theme}
                        onClick={this.props.onSelect}
                        item={item}
                        itemContext={this.props.listItemContext}
                    />
                ))}
            />
        );
    }
}

List.defaultProps = {
    ListComponent: ListComponent,
    ListItemComponent: ListComponentItem,
    query: {},
    filterFields: []
};

List.propTypes = {
    theme: React.PropTypes.object,
    type: React.PropTypes.string.isRequired,
    filter: React.PropTypes.string,
    filterFields: React.PropTypes.array,
    query: React.PropTypes.object,
    onSelect: React.PropTypes.func,
    ListComponent: React.PropTypes.func.isRequired,
    ListItemComponent: React.PropTypes.func.isRequired,
    listItemContext: React.PropTypes.any
};

export default List;
