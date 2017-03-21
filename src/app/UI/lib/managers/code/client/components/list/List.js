
import React from "react";
import LightComponent from "ui-lib/light_component";
import ImmutablePropTypes from "react-immutable-proptypes";
import {
    ListPager as TAListPager
} from "ui-components/type_admin";
import { Loading } from "ui-components/layout";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import Row from "./Row";
import Header from "./Header";

class List extends LightComponent {
    constructor(props) {
        super(props);

        this.items = new this.props.ObservableList({
            query: props.query,
            filter: props.filter,
            limit: props.limit
        });

        this.state = {
            items: this.items.value.getValue(),
            itemsState: this.items.state.getValue()
        };
    }

    componentDidMount() {
        this.log("componentDidMount");

        this.addDisposable(this.items.start());
        this.addDisposable(this.items.value.subscribe((items) => this.setState({ items })));
        this.addDisposable(this.items.state.subscribe((itemsState) => this.setState({ itemsState })));
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

    componentWillReceiveProps(nextProps) {
        this.log("componentWillReceiveProps");

        if (nextProps.filter) {
            this.items.setOpts({ filter: nextProps.filter });
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

        return (
            <div className={this.props.theme.listContainer}>
                <Loading show={this.state.state === ObservableDataStates.LOADING}/>
                <table className={this.props.theme.table}>
                    <tbody className={this.props.theme.header}>
                        <Header
                            theme={this.props.theme}
                            steps={this.props.steps}
                        />
                    </tbody>
                    <tbody className={this.props.theme.list}>
                        <For each="item" of={this.state.items}>
                            <Row
                                key={item.get("_id")}
                                theme={this.props.theme}
                                onClick={(item, step) => this.gotoStep(item, step)}
                                item={item}
                                steps={this.props.steps}
                            />
                        </For>
                    </tbody>
                </table>
                <If condition={this.props.limit > 0}>
                    <TAListPager
                        pagedList={this.items}
                        pagingInfo={this.items.pagingInfo.getValue()}
                    />
                </If>
            </div>
        );
    }
}

List.defaultProps = {
    limit: 0
};

List.propTypes = {
    theme: React.PropTypes.object,
    query: React.PropTypes.object.isRequired,
    filter: React.PropTypes.string,
    pathname: React.PropTypes.string.isRequired,
    limit: React.PropTypes.number,
    steps: ImmutablePropTypes.list,
    ObservableList: React.PropTypes.func.isRequired
};

List.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default List;
