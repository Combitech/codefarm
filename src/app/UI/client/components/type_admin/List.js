
import React from "react";
import LightComponent from "ui-lib/light_component";
import LoadIndicator from "./LoadIndicator";
import ListComponentItem from "./ListItem";
import ListComponent from "./ListComponent";
import TypeList from "ui-observables/type_list";
import { States as ObservableDataStates } from "ui-lib/observable_data";

class List extends LightComponent {
    constructor(props) {
        super(props, true);

        this.typeList = new TypeList({
            type: props.type,
            query: props.query,
            filter: props.filter,
            filterFields: props.filterFields
        });

        this.state = {
            list: this.typeList.value.getValue(),
            state: this.typeList.state.getValue()
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
    }

    render() {
        this.log("render", this.props, this.state);

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
