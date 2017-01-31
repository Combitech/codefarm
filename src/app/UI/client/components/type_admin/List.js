
import React from "react";
import Component from "ui-lib/component";
import LoadIndicator from "./LoadIndicator";
import ListComponentItem from "./ListItem";
import { List, ListDivider } from "react-toolbox/lib/list";

class ListComponent extends Component {
    constructor(props) {
        super(props);

        this.addTypeListStateVariable("list", (props) => props.type, (props) => props.query, true);
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
            <List
                className={this.props.theme.list}
                ripple={true}
            >
                <ListDivider key="top_divider" />
                <div className={this.props.theme.divider} />
                {this.state.list.slice(0).reverse().map((item) => (
                    <div key={item._id}>
                        <this.props.ListItemComponent
                            theme={this.props.theme}
                            onClick={this.props.onSelect}
                            item={item}
                            itemContext={this.props.listItemContext}
                        />
                        <ListDivider />
                    </div>
                ))}
            </List>
        );
    }
}

ListComponent.defaultProps = {
    ListItemComponent: ListComponentItem,
    query: {}
};

ListComponent.propTypes = {
    theme: React.PropTypes.object,
    type: React.PropTypes.string.isRequired,
    filter: React.PropTypes.string,
    query: React.PropTypes.object,
    onSelect: React.PropTypes.func,
    ListItemComponent: React.PropTypes.func.isRequired,
    listItemContext: React.PropTypes.any
};

export default ListComponent;
