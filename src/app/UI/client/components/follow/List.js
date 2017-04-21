
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import { ListPager } from "ui-components/type_admin";
import { Loading } from "ui-components/layout";
import StepListObservable from "ui-observables/step_list";

class List extends LightComponent {
    constructor(props) {
        super(props);

        this.steps = new StepListObservable({
            flowId: this.props.flowId,
            visible: true,
            sortOn: "created",
            sortDesc: false,
            subscribe: false
        });

        this.items = new this.props.ObservableList({
            query: props.query,
            filter: props.filter,
            limit: props.limit
        });

        this.state = {
            steps: this.steps.value.getValue(),
            items: this.items.value.getValue(),
            itemsState: this.items.state.getValue()
        };
    }

    componentDidMount() {
        this.log("componentDidMount");

        this.addDisposable(this.items.start());
        this.addDisposable(this.items.value.subscribe((items) => this.setState({ items })));
        this.addDisposable(this.items.state.subscribe((itemsState) => this.setState({ itemsState })));

        this.addDisposable(this.steps.start());
        this.addDisposable(this.steps.value.subscribe((steps) => this.setState({ steps })));
    }

    componentWillReceiveProps(nextProps) {
        this.log("componentWillReceiveProps");

        if (nextProps.flowId !== this.props.flowId) {
            this.steps.setOpts({ flowId: nextProps.flowId });
        }

        if (nextProps.filter !== this.props.filter) {
            this.items.setOpts({ filter: nextProps.filter });
        }
    }

    componentDidUpdate() {
        this.log("componentDidUpdate");

        if (this.props.limit > 0) {
            /* If relative paging is used and current page has no next or previous
             * page, then automatically navigate to last or first page.
             */
            const pagingInfo = this.items.pagingInfo.getValue().toJS();

            if (pagingInfo.isRelative) {
                if (!pagingInfo.hasNextPage) {
                    this.log("setLastPage");
                    this.items.setLastPage();
                } else if (!pagingInfo.hasPrevPage) {
                    this.log("setFirstPage");
                    this.items.setFirstPage();
                }
            }
        }
    }

    gotoStep(item, step) {
        this.context.router.push({
            pathname: `${this.props.pathname}/${item._id}`,
            query: step ? { step } : {}
        });
    }

    render() {
        this.log("render", this.props, this.state);

        const steps = this.state.steps; // TODO: Sort these in the flow order

        return (
            <div className={this.props.theme.listContainer}>
                <Loading show={this.state.state === ObservableDataStates.LOADING}/>
                <Choose>
                    <When condition={this.state.items.size === 0}>
                        <div className={this.props.theme.emptyTable}>
                            Nothing to list
                        </div>
                    </When>
                    <Otherwise>
                        <table className={this.props.theme.table}>
                            <tbody className={this.props.theme.header}>
                                <this.props.HeaderComponent
                                    theme={this.props.theme}
                                    steps={steps}
                                />
                            </tbody>
                            <tbody className={this.props.theme.list}>
                                <For each="item" of={this.state.items}>
                                    <this.props.RowComponent
                                        key={item.get("_id")}
                                        theme={this.props.theme}
                                        onClick={(item, step) => this.gotoStep(item, step)}
                                        item={item}
                                        steps={steps}
                                    />
                                </For>
                            </tbody>
                        </table>
                        <If condition={this.props.limit > 0}>
                            <ListPager
                                pagedList={this.items}
                                pagingInfo={this.items.pagingInfo.getValue()}
                            />
                        </If>
                    </Otherwise>
                </Choose>
            </div>
        );
    }
}

List.defaultProps = {
    limit: 0
};

List.propTypes = {
    theme: PropTypes.object,
    query: PropTypes.object.isRequired,
    filter: PropTypes.string,
    pathname: PropTypes.string.isRequired,
    limit: PropTypes.number,
    ObservableList: PropTypes.func.isRequired,
    RowComponent: PropTypes.func.isRequired,
    HeaderComponent: PropTypes.func.isRequired,
    flowId: PropTypes.string.isRequired
};

List.contextTypes = {
    router: PropTypes.object.isRequired
};

export default List;
