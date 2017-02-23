
import React from "react";
import Component from "ui-lib/component";
import LoadIndicator from "./LoadIndicator";
import ListComponentItem from "./ListItem";
import ListComponent from "./ListComponent";
import { Button } from "react-toolbox/lib/button";
import { ListDivider } from "react-toolbox/lib/list";
import { filterFields as qbFilterFields } from "ui-lib/query_builder";

const END_MARK_HEAD = "__HEAD__";
const END_MARK_TAIL = "__TAIL__";
const isEndMarkPath = (path) => path.includes("/page/") && (
    (path.endsWith(END_MARK_HEAD) || path.endsWith(END_MARK_TAIL))
);

const TURN_PAGE_KIND = {
    NEXT: "NEXT",
    PREV: "PREV",
    FIRST: "FIRST",
    LAST: "LAST"
};

class PagedListComponent extends Component {
    constructor(props) {
        super(props, true);

        this.addStateVariable("nextPageHasMoreData", false);

        this.addTypePagedListStateVariable(
            "list",
            (props) => props.type,
            (props) => ({
                pageSize: props.pageSize,
                sortOn: props.sortOn,
                sortOnType: props.sortOnType,
                relativeValue: (props.pathname.includes("/page/") && !isEndMarkPath(props.pathname))
                    ? props.pathname.split("/").pop() : null,
                sortDesc: props.pathname.includes("/page/from/"),
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
        const dirFromTurnKind = {
            [ TURN_PAGE_KIND.NEXT ]: "from",
            [ TURN_PAGE_KIND.FIRST ]: "from",
            [ TURN_PAGE_KIND.PREV ]: "to",
            [ TURN_PAGE_KIND.LAST ]: "to"
        };
        const direction = dirFromTurnKind[turnKind];
        let basePath = this.props.pathname;
        const removeStart = basePath.indexOf("/page/");
        if (removeStart !== -1) {
            basePath = basePath.slice(0, removeStart);
        }
        const wasLastTurnPrev = this.props.pathname.includes("/page/to/");
        let itemIdx;
        let value;
        if (turnKind === TURN_PAGE_KIND.NEXT || turnKind === TURN_PAGE_KIND.PREV) {
            if (direction === "from") {
                itemIdx = wasLastTurnPrev ? 0 : this.state.list.length - 1;
            } else {
                itemIdx = wasLastTurnPrev ? this.state.list.length - 1 : 0;
            }
            const relativeToItem = this.state.list[itemIdx];
            value = relativeToItem[this.props.sortOn];
        } else {
            value = direction === "from" ? END_MARK_HEAD : END_MARK_TAIL;
        }
        const newPath = `${basePath}/page/${direction}/${value}`;
        console.log(`TURN ${newPath} - ${turnKind} - ${direction}`);
        this.context.router.push({
            pathname: newPath
        });
    }

    componentDidUpdate() {
        // If we find that we have navigated to head or tail, change
        // route so that we follow head or tail
        const nextHasNoData = this.state.nextPageHasMoreData.value === false;
        if (nextHasNoData && !isEndMarkPath(this.props.pathname)) {
            if (this.props.pathname.includes("/page/from/")) {
                // We are at end, follow tail
                this.context.router.push({
                    pathname: this.props.pathname.replace(/\/page\/from\/[^\/]*/, `/page/to/${END_MARK_TAIL}`)
                });
            } else if (this.props.pathname.includes("/page/to/")) {
                // We are at start, follow head
                this.context.router.push({
                    pathname: this.props.pathname.replace(/\/page\/to\/[^\/]*/, `/page/from/${END_MARK_HEAD}`)
                });
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

        const nextPageHasNoData = this.props.pathname.includes("/page/from/") && this.state.nextPageHasMoreData.value === false;
        const prevPageHasNoData = this.props.pathname.includes("/page/to/") && this.state.nextPageHasMoreData.value === false;
        if ((nextPageHasNoData || prevPageHasNoData) && !isEndMarkPath(this.props.pathname)) {
            // Skip rendering since componentDidUpdate will trigger a re-render anyway
            return;
        }

        let list = this.state.list;
        if (list && this.props.pathname.includes("/page/to/")) {
            list = list.slice(0).reverse();
        }

        return (
            <div>
                <this.props.ListComponent
                    theme={this.props.theme}
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
                        disabled={this.props.pathname.includes(`/page/from/${END_MARK_HEAD}`)}
                        onClick={() => this.turnPage(TURN_PAGE_KIND.FIRST)}
                    />
                    <Button
                        icon="navigate_before"
                        disabled={list.length === 0 ||
                            this.props.pathname.includes(`/page/from/${END_MARK_HEAD}`) ||
                            prevPageHasNoData
                        }
                        onClick={() => this.turnPage(TURN_PAGE_KIND.PREV)}
                    />
                    <Button
                        icon="navigate_next"
                        disabled={list.length === 0 ||
                            this.props.pathname.includes(`/to/${END_MARK_TAIL}`) ||
                            nextPageHasNoData
                        }
                        onClick={() => this.turnPage(TURN_PAGE_KIND.NEXT)}
                    />
                    <Button
                        icon="last_page"
                        disabled={this.props.pathname.includes(`/to/${END_MARK_TAIL}`)}
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
    ListItemComponent: React.PropTypes.func.isRequired,
    listItemContext: React.PropTypes.any,
    pageSize: React.PropTypes.number,
    sortOn: React.PropTypes.string,
    sortOnType: React.PropTypes.string,
    pathname: React.PropTypes.string.isRequired
};

PagedListComponent.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default PagedListComponent;
