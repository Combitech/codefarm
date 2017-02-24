
import React from "react";
import Component from "ui-lib/component";
import LoadIndicator from "./LoadIndicator";
import ListComponentItem from "./ListItem";
import ListComponent from "./ListComponent";
import { Button } from "react-toolbox/lib/button";
import { filterFields as qbFilterFields } from "ui-lib/query_builder";

const END_MARK_HEAD = "__HEAD__";
const END_MARK_TAIL = "__TAIL__";
const isEndMark = (value) => value === END_MARK_HEAD || value === END_MARK_TAIL;

const TURN_PAGE_KIND = {
    NEXT: "NEXT",
    PREV: "PREV",
    FIRST: "FIRST",
    LAST: "LAST"
};

const isFromRelative = (relative) => relative === END_MARK_HEAD || relative.startsWith(">");
const isToRelative = (relative) => relative === END_MARK_TAIL || relative.startsWith("<");
const encodeRelative = (value, isFrom = null) =>
    `${typeof isFrom !== "boolean" ? "" : (isFrom ? ">" : "<")}${value}`;

class PagedListComponent extends Component {
    constructor(props) {
        super(props);

        this.addStateVariable("nextPageHasMoreData", false);

        this.addTypePagedListStateVariable(
            "list",
            (props) => props.type,
            (props) => ({
                pageSize: props.pageSize,
                sortOn: props.sortOn,
                sortOnType: props.sortOnType,
                relativeValue: !isEndMark(props.relative.value)
                    ? props.relative.value.substr(1) : null,
                sortDesc: isFromRelative(props.relative.value),
                hasMoreDataCb: (nextPageHasMoreData) => this.state.nextPageHasMoreData.set(nextPageHasMoreData)
            }),
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

    turnPage(turnKind) {
        const isFrom = turnKind === TURN_PAGE_KIND.NEXT || turnKind === TURN_PAGE_KIND.FIRST;
        let itemIdx;
        let value = encodeRelative(isFrom ? END_MARK_HEAD : END_MARK_TAIL);
        if (turnKind === TURN_PAGE_KIND.NEXT || turnKind === TURN_PAGE_KIND.PREV) {
            const wasLastTurnPrev = isToRelative(this.props.relative.value);
            if (isFrom) {
                itemIdx = wasLastTurnPrev ? 0 : this.state.list.length - 1;
            } else {
                itemIdx = wasLastTurnPrev ? this.state.list.length - 1 : 0;
            }
            const relativeToItem = this.state.list[itemIdx];
            value = encodeRelative(relativeToItem[this.props.sortOn], isFrom);
        }
        this.props.relative.set(value);
    }

    componentDidUpdate() {
        // If we find that we have navigated to head or tail, change
        // route so that we follow head or tail
        const nextHasNoData = this.state.nextPageHasMoreData.value === false;
        if (nextHasNoData && !isEndMark(this.props.relative.value)) {
            if (isFromRelative(this.props.relative.value)) {
                // We are at end, follow tail
                this.props.relative.set(encodeRelative(END_MARK_TAIL));
            } else {
                // We are at start, follow head
                this.props.relative.set(encodeRelative(END_MARK_HEAD));
            }
        }
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

        const relative = this.props.relative.value;
        const isRelativeFrom = isFromRelative(relative);
        const noMoreData = this.state.nextPageHasMoreData.value === false;

        const nextPageHasNoData = isRelativeFrom && noMoreData;
        const prevPageHasNoData = !isRelativeFrom && noMoreData;
        if ((nextPageHasNoData || prevPageHasNoData) && !isEndMark(relative)) {
            // Skip rendering since componentDidUpdate will trigger a re-render anyway
            return;
        }

        const isFirstPage = isRelativeFrom && relative === END_MARK_HEAD;
        const isLastPage = !isRelativeFrom && relative === END_MARK_TAIL;

        let list = this.state.list;
        if (list && !isRelativeFrom) {
            list = list.slice(0).reverse();
        }

        return (
            <div>
                <this.props.ListComponent
                    theme={this.props.theme}
                    listContext={this.props.listContext}
                    children={list && list.map((item) => (
                        <this.props.ListItemComponent
                            key={item._id}
                            theme={this.props.theme}
                            onClick={this.props.onSelect}
                            item={item}
                            itemContext={this.props.listItemContext}
                        />
                    ))}
                />
                <div>
                    <Button
                        icon="first_page"
                        disabled={isFirstPage}
                        onClick={() => this.turnPage(TURN_PAGE_KIND.FIRST)}
                    />
                    <Button
                        icon="navigate_before"
                        disabled={list.length === 0 ||
                            isFirstPage ||
                            prevPageHasNoData
                        }
                        onClick={() => this.turnPage(TURN_PAGE_KIND.PREV)}
                    />
                    <Button
                        icon="navigate_next"
                        disabled={list.length === 0 ||
                            isLastPage ||
                            nextPageHasNoData
                        }
                        onClick={() => this.turnPage(TURN_PAGE_KIND.NEXT)}
                    />
                    <Button
                        icon="last_page"
                        disabled={isLastPage}
                        onClick={() => this.turnPage(TURN_PAGE_KIND.LAST)}
                    />
                </div>
            </div>
        );
    }
}

PagedListComponent.defaultProps = {
    ListComponent: ListComponent,
    ListItemComponent: ListComponentItem,
    query: {},
    pageSize: 5,
    sortOn: "created",
    sortOnType: "Date",
    filterFields: []
};

PagedListComponent.propTypes = {
    theme: React.PropTypes.object,
    type: React.PropTypes.string.isRequired,
    filter: React.PropTypes.string,
    filterFields: React.PropTypes.array,
    query: React.PropTypes.object,
    onSelect: React.PropTypes.func,
    ListComponent: React.PropTypes.func.isRequired,
    listContext: React.PropTypes.any,
    ListItemComponent: React.PropTypes.func.isRequired,
    listItemContext: React.PropTypes.any,
    pageSize: React.PropTypes.number,
    sortOn: React.PropTypes.string,
    sortOnType: React.PropTypes.string,
    relative: React.PropTypes.object.isRequired,
    // Required by state_var when linkToLocation is used
    route: React.PropTypes.object.isRequired
};

PagedListComponent.contextTypes = {
    // Required by state_var when linkToLocation is used
    router: React.PropTypes.object.isRequired
};

export default PagedListComponent;
