
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import LoadIndicator from "./LoadIndicator";
import ListComponentItem from "./ListItem";
import ListComponent from "./ListComponent";
import ListPager from "./ListPager";
import PagedTypeList from "ui-observables/paged_type_list";
import { States as ObservableDataStates } from "ui-lib/observable_data";

class PagedList extends LightComponent {
    constructor(props) {
        super(props);

        this.typeList = new PagedTypeList({
            type: props.type,
            query: props.query,
            sortOn: props.sortOn,
            sortOnType: props.sortOnType,
            sortDesc: props.sortDesc,
            limit: props.limit,
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
            sortOn: nextProps.sortOn,
            sortOnType: nextProps.sortOnType,
            sortDesc: nextProps.sortDesc,
            limit: nextProps.limit,
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

    componentDidUpdate() {
        /* If relative paging is used and current page has no next or previous
         * page, then automatically navigate to last or first page.
         */
        const pagingInfo = this.typeList.pagingInfo.getValue().toJS();
        if (pagingInfo.isRelative) {
            if (!pagingInfo.hasNextPage) {
                this.log("setLastPage");
                this.typeList.setLastPage();
            } else if (!pagingInfo.hasPrevPage) {
                this.log("setFirstPage");
                this.typeList.setFirstPage();
            }
        }
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
            <div>
                <this.props.ListComponent
                    theme={this.props.theme}
                    listContext={this.props.listContext}
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
                {this.state.list && this.state.list.size > 0 &&
                    <ListPager
                        theme={this.props.theme}
                        pagedList={this.typeList}
                        pagingInfo={this.typeList.pagingInfo.getValue()}
                    />
                }
            </div>
        );
    }
}

PagedList.defaultProps = {
    ListComponent: ListComponent,
    ListItemComponent: ListComponentItem,
    query: {},
    limit: 5,
    sortOn: "created",
    sortOnType: "Date",
    sortDesc: true,
    filter: "",
    filterFields: []
};

PagedList.propTypes = {
    theme: PropTypes.object,
    type: PropTypes.string.isRequired,
    filter: PropTypes.string,
    filterFields: PropTypes.array,
    query: PropTypes.object,
    onSelect: PropTypes.func,
    ListComponent: PropTypes.func.isRequired,
    listContext: PropTypes.any,
    ListItemComponent: PropTypes.func.isRequired,
    listItemContext: PropTypes.any,
    limit: PropTypes.number,
    sortOn: PropTypes.string,
    sortOnType: PropTypes.string,
    sortDesc: PropTypes.bool
};

PagedList.contextTypes = {
    // Required by state_var when linkToLocation is used
    router: PropTypes.object.isRequired
};

export default PagedList;
