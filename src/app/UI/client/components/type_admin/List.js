
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import LoadIndicator from "./LoadIndicator";
import ListComponentItem from "./ListItem";
import ListComponent from "./ListComponent";
import TypeList from "ui-observables/type_list";
import { States as ObservableDataStates } from "ui-lib/observable_data";

class List extends LightComponent {
    constructor(props) {
        super(props, false);

        this.typeList = new TypeList({
            type: props.type,
            query: props.query,
            filter: props.filter,
            filterFields: props.filterFields
        });

        this.state = {
            list: this.typeList.value.getValue(),
            state: this.typeList.state.getValue(),
            error: this.typeList.error.getValue()
        };
    }

    componentWillReceiveProps(nextProps) {
        this.log("componentWillReceiveProps", nextProps);
        this.typeList.setOpts({
            type: nextProps.type,
            query: nextProps.query,
            filter: nextProps.filter,
            filterFields: nextProps.filterFields
        });
    }

    componentDidMount() {
        this.log("componentDidMount");
        this.addDisposable(this.typeList.start());
        this.addDisposable(this.typeList.value.subscribe((list) => this.setState({ list })));
        this.addDisposable(this.typeList.state.subscribe((state) => this.setState({ state })));
        this.addDisposable(this.typeList.error.subscribe((error) => this.setState({ error })));
    }

    render() {
        this.log("render", this.props, this.state);

        if (this.state.error) {
            return (
                <pre>{this.state.error.toJS()}</pre>
            );
        }

        if (this.state.state === ObservableDataStates.LOADING) {
            return (
                <LoadIndicator theme={this.props.theme}/>
            );
        }

        return (
            <this.props.ListComponent
                theme={this.props.theme}
                children={this.state.list && this.state.list.toJS().map((item) => (
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
    filter: "",
    filterFields: []
};

List.propTypes = {
    theme: PropTypes.object,
    type: PropTypes.string.isRequired,
    filter: PropTypes.string,
    filterFields: PropTypes.array,
    query: PropTypes.object,
    onSelect: PropTypes.func,
    ListComponent: PropTypes.func.isRequired,
    ListItemComponent: PropTypes.func.isRequired,
    listItemContext: PropTypes.any
};

export default List;
